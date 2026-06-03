import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const bytes = Buffer.from(buffer)

    // Validate PDF magic bytes — client-supplied MIME type cannot be trusted
    if (bytes.length < 5 || bytes.slice(0, 4).toString('ascii') !== '%PDF') {
      return NextResponse.json({ error: 'File does not appear to be a valid PDF.' }, { status: 400 })
    }

    // Dynamic import avoids Next.js bundler issues with pdf-parse's test-file loading
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(bytes)
    const text = (data.text ?? '').trim()

    if (text.length < 50) {
      return NextResponse.json(
        {
          error:
            'Could not extract readable text from this PDF. Please ensure it is a text-based PDF and not a scanned image.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      text: text.slice(0, 20000),
      pages: data.numpages,
    })
  } catch (err) {
    console.error('PDF extraction error:', err)
    return NextResponse.json(
      { error: 'Failed to process PDF. Please check the file and try again.' },
      { status: 500 }
    )
  }
}
