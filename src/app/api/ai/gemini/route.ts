import { NextResponse } from 'next/server'

type ReqBody = {
  input: string
}

/**
 * Server route that proxies a simple text generation request to Google's
 * Generative Language (PaLM / Gemini) REST endpoint.
 *
 * Notes / assumptions:
 * - Expects an API key in process.env.GEMINI_API_KEY (API key style as in .env.local)
 * - Expects a model id in process.env.GEMINI_MODEL (default: text-bison-001)
 * - Uses the v1beta2 `:generateText` endpoint and extracts `candidates[0].output`.
 *
 * If you use a different Gemini/Vertex endpoint, update the `url` formation below.
 */
export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json()
    const input = body?.input ?? ''

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing `input` in request body' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || 'text-bison-001'

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500 })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(
      model
    )}:generateText?key=${encodeURIComponent(apiKey)}`

    const payload = {
      prompt: { text: input },
      temperature: 0.2,
      maxOutputTokens: 512
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data || 'Gemini API error' }, { status: res.status })
    }

    // Typical generateText response contains `candidates[0].output`.
    const text = data?.candidates?.[0]?.output ?? data?.output ?? JSON.stringify(data)

    return NextResponse.json({ text })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
