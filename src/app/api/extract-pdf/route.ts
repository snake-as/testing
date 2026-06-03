import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB.' }, { status: 400 })
    }

    // Read raw bytes and extract text by simple pattern matching
    // pdf-lib doesn't do text extraction, so we do a raw string parse
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const raw = new TextDecoder('latin1').decode(bytes)

    // Extract text content between BT and ET markers (PDF text operators)
    const textChunks: string[] = []
    const btEtRegex = /BT[\s\S]*?ET/g
    const matches = raw.match(btEtRegex) || []
    for (const block of matches) {
      const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g) || []
      const tJMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || []
      for (const m of tjMatches) {
        const text = m.replace(/\(([^)]+)\)\s*Tj/, '$1')
        textChunks.push(text)
      }
      for (const m of tJMatches) {
        const inner = m.replace(/\[([^\]]+)\]\s*TJ/, '$1')
        const parts = inner.match(/\(([^)]+)\)/g) || []
        for (const p of parts) {
          textChunks.push(p.slice(1, -1))
        }
      }
    }

    let extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim()

    // Fallback: if minimal text extracted, use raw readable chars
    if (extracted.length < 100) {
      extracted = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 20000)
    }

    if (extracted.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Please ensure it is a text-based PDF.' }, { status: 400 })
    }

    return NextResponse.json({ text: extracted.slice(0, 20000) })
  } catch (err) {
    console.error('PDF extraction error:', err)
    return NextResponse.json({ error: 'Failed to extract PDF text.' }, { status: 500 })
  }
}
