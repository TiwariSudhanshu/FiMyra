import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

type ReqBody = {
  input: string
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json()
    const input = body?.input ?? ''

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing `input` in request body' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500 })
    }

    const client = new GoogleGenAI({ apiKey })

    // Call the SDK's `models.generateContent` per the example snippet.
    const response = await client.models.generateContent({
      model,
      contents: input,
    })

    // `response.text` holds the generated text in the SDK example
    const text = (response as any)?.text ?? JSON.stringify(response)

    return NextResponse.json({ text })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
