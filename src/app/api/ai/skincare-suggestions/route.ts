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

// POST - Get AI skin care suggestions
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

    const user = await User.findById(userId).select('skinCareProfile healthProfile name');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { skinCareProfile, healthProfile } = user;
    const age = healthProfile?.age || 'not specified';
    const gender = healthProfile?.gender || 'not specified';

    // Only require skin type - other fields are optional
    if (!skinCareProfile || !skinCareProfile.skinType) {
      return NextResponse.json(
        { success: false, message: 'Please select your skin type first. You can add more details for better recommendations!' },
        { status: 400 }
      );
    }

    // Build prompt for AI
    const prompt = `You are a professional dermatologist and skin care expert. Provide personalized skin care recommendations based on the following profile:

**User Profile:**
- Age: ${age}
- Gender: ${gender}
- Skin Type: ${skinCareProfile.skinType}
- Skin Concerns: ${skinCareProfile.concerns?.join(', ') || 'None specified'}
- Current Routine:
  * Morning Routine: ${skinCareProfile.routine?.morning?.join(', ') || 'Not specified'}
  * Evening Routine: ${skinCareProfile.routine?.evening?.join(', ') || 'Not specified'}
  * Products Used: ${skinCareProfile.routine?.products?.join(', ') || 'Not specified'}
- Skin Goals: ${skinCareProfile.goals?.join(', ') || 'General skin health'}

**Please provide:**
1. **Morning Routine** (3-4 specific steps for morning skin care based on their skin type)
2. **Evening Routine** (3-4 specific steps for evening skin care)
3. **Product Recommendations** (4-5 specific product types or key ingredients to look for based on their skin type and concerns)
4. **Lifestyle Tips** (2-3 lifestyle, diet, or habit suggestions that can improve skin health for someone of their age)
5. **Common Mistakes** (2-3 things to avoid based on their skin type and current routine)

**Format your response as a JSON object with these exact keys:**
- morningRoutine: array of strings (morning care steps)
- eveningRoutine: array of strings (evening care steps)
- productRecommendations: array of strings (product suggestions with key ingredients)
- lifestyleTips: array of strings (lifestyle and dietary advice)
- avoidMistakes: array of strings (things to avoid)

Keep each tip concise (1-2 sentences) and practical. Consider their age and skin type when making recommendations.

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
        morningRoutine: [
          'Cleanse your face with a gentle, pH-balanced cleanser',
          'Apply a vitamin C serum to brighten and protect',
          'Moisturize with a lightweight, non-comedogenic moisturizer',
          'Finish with broad-spectrum SPF 30+ sunscreen'
        ],
        eveningRoutine: [
          'Remove makeup and cleanse thoroughly',
          'Use a toner to balance skin pH',
          'Apply treatment serums (retinol, niacinamide, etc.)',
          'Finish with a richer night cream or moisturizer'
        ],
        productRecommendations: [
          'Look for hyaluronic acid for hydration',
          'Use niacinamide to reduce inflammation and pores',
          'Consider retinol for anti-aging (start slow)',
          'Try ceramides to strengthen skin barrier',
          'Use chemical exfoliants (AHA/BHA) 2-3 times per week'
        ],
        lifestyleTips: [
          'Drink at least 8 glasses of water daily for skin hydration',
          'Get 7-8 hours of quality sleep for skin regeneration',
          'Eat antioxidant-rich foods like berries, nuts, and green tea'
        ],
        avoidMistakes: [
          'Don\'t skip sunscreen - UV damage accelerates aging',
          'Avoid over-exfoliating - it can damage your skin barrier',
          'Don\'t use hot water - it strips natural oils from skin'
        ]
      };
    }

    return NextResponse.json({
      success: true,
      suggestions,
      profile: {
        skinType: skinCareProfile.skinType,
        concerns: skinCareProfile.concerns,
        age
      }
    });

  } catch (error) {
    console.error('Error generating skin care suggestions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
