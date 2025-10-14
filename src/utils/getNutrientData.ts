import { GoogleGenAI } from '@google/genai'

export type NutrientData = {
  carbs: number
  protein: number
  fat: number
  fiber: number
  calories: number
}

export type MealItem = {
  name: string
  quantity?: number
  unit?: string
  carbs?: number
  protein?: number
  fat?: number
  fiber?: number
  calories?: number
}

/**
 * Fetches nutrient data for a meal from Gemini AI
 * @param mealName - The name of the meal to get nutrients for
 * @returns Nutrient data object with carbs, protein, fat, fiber, and calories
 */
export async function getNutrientData(mealName: string): Promise<NutrientData | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return null
    }

    const client = new GoogleGenAI({ apiKey })

    const prompt = `Provide approximate nutritional values for '${mealName}' in this exact JSON format (no markdown, no extra text, just the JSON object):
{ "carbs": number, "protein": number, "fat": number, "fiber": number, "calories": number }

All values should be in grams except calories which is in kcal. Provide reasonable estimates for a typical serving.`

    const response = await client.models.generateContent({
      model,
      contents: prompt,
    })

    const text = (response as any)?.text ?? ''
    
    // Clean up response - remove markdown code blocks if present
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '')
    }
    
    // Parse JSON
    const nutrientData = JSON.parse(cleanText) as NutrientData
    
    // Validate the response has required fields
    if (
      typeof nutrientData.carbs === 'number' &&
      typeof nutrientData.protein === 'number' &&
      typeof nutrientData.fat === 'number' &&
      typeof nutrientData.fiber === 'number' &&
      typeof nutrientData.calories === 'number'
    ) {
      return nutrientData
    }
    
    console.error('Invalid nutrient data structure received from Gemini')
    return null
  } catch (error) {
    console.error('Error fetching nutrient data from Gemini:', error)
    return null
  }
}
