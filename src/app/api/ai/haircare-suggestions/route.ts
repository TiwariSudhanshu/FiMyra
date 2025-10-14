import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { decode } from 'next-auth/jwt';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { GoogleGenAI } from '@google/genai';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

async function getUserIdFromReq(req: Request | any) {
  const cookies = (req.cookies && typeof req.cookies.get === 'function') ? req.cookies : null;
  let userId: string | null = null;

  if (cookies) {
    const nextAuthToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    if (nextAuthToken) {
      try {
        const decoded = await decode({ token: nextAuthToken, secret: process.env.NEXTAUTH_SECRET! });
        if (decoded?.userId) userId = decoded.userId as string;
        else if (decoded?.sub) userId = decoded.sub as string;
      } catch (e) {
        // ignore
      }
    }
  }

  if (!userId && cookies) {
    const token = cookies.get('auth-token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {
        // ignore
      }
    }
  }

  return userId;
}

// POST - Get AI hair care suggestions
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select('hairCareProfile healthProfile name');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { hairCareProfile, healthProfile } = user;
    const age = healthProfile?.age || 'not specified';
    const gender = healthProfile?.gender || 'not specified';

    if (!hairCareProfile || !hairCareProfile.hairType) {
      return NextResponse.json(
        { success: false, message: 'Please complete your hair care profile first' },
        { status: 400 }
      );
    }

    // Build prompt for AI
    const prompt = `You are a professional hair care expert and trichologist. Provide personalized hair care recommendations based on the following profile:

**User Profile:**
- Age: ${age}
- Gender: ${gender}
- Hair Type: ${hairCareProfile.hairType}
- Hair Concerns: ${hairCareProfile.concerns?.join(', ') || 'None specified'}
- Current Routine:
  * Wash Frequency: ${hairCareProfile.routine?.frequency || 'Not specified'}
  * Shampoo: ${hairCareProfile.routine?.shampoo || 'Not specified'}
  * Conditioner: ${hairCareProfile.routine?.conditioner || 'Not specified'}
  * Treatments: ${hairCareProfile.routine?.treatments?.join(', ') || 'None'}
- Hair Goals: ${hairCareProfile.goals?.join(', ') || 'General hair health'}

**Please provide:**
1. **Daily Care Routine** (2-3 specific actionable tips for daily hair care)
2. **Weekly Treatments** (2-3 recommended weekly treatments or masks based on their concerns and hair type)
3. **Product Recommendations** (3-4 specific product types or ingredients to look for based on their hair type and concerns)
4. **Lifestyle Tips** (2-3 lifestyle or dietary suggestions that can improve hair health for someone of their age)
5. **Common Mistakes** (2-3 things to avoid based on their current routine and hair type)

**Format your response as a JSON object with these exact keys:**
- dailyCare: array of strings (actionable tips)
- weeklyTreatments: array of strings (treatment recommendations)
- productRecommendations: array of strings (product suggestions)
- lifestyleTips: array of strings (lifestyle advice)
- avoidMistakes: array of strings (things to avoid)

Keep each tip concise (1-2 sentences) and practical. Consider their age when making recommendations.

Return ONLY the JSON object, no other text.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'AI service not configured' },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    let text = (response as any)?.text ?? JSON.stringify(response);

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let suggestions;
    try {
      suggestions = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Fallback suggestions
      suggestions = {
        dailyCare: [
          'Use a sulfate-free shampoo to maintain your hair\'s natural oils',
          'Apply conditioner from mid-length to ends, avoiding the scalp',
          'Gently detangle hair when wet using a wide-tooth comb'
        ],
        weeklyTreatments: [
          'Apply a deep conditioning mask once a week for 20-30 minutes',
          'Use a scalp massage with oil to improve blood circulation',
          'Try a protein treatment if you have damaged or processed hair'
        ],
        productRecommendations: [
          'Look for products with argan oil or coconut oil for moisture',
          'Use a heat protectant spray before styling with heat tools',
          'Consider a leave-in conditioner for extra protection',
          'Try silk or satin pillowcases to reduce friction'
        ],
        lifestyleTips: [
          'Stay hydrated by drinking at least 8 glasses of water daily',
          'Eat protein-rich foods like eggs, fish, and nuts for hair strength',
          'Take biotin or vitamin E supplements after consulting your doctor'
        ],
        avoidMistakes: [
          'Avoid washing hair with very hot water - use lukewarm instead',
          'Don\'t rub hair vigorously with a towel - pat dry gently',
          'Minimize heat styling and always use a heat protectant when you do'
        ]
      };
    }

    return NextResponse.json({
      success: true,
      suggestions,
      profile: {
        hairType: hairCareProfile.hairType,
        concerns: hairCareProfile.concerns,
        age
      }
    });

  } catch (error) {
    console.error('Error generating hair care suggestions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
