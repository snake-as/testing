import { NextRequest, NextResponse } from 'next/server'
import { generateClaimPDF } from '@/lib/pdf'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { policyAnalysis, damageInventory, disputeLetter, formSummary } = await req.json()

    if (!policyAnalysis || !damageInventory || !disputeLetter) {
      return NextResponse.json({ error: 'Missing required content sections.' }, { status: 400 })
    }

    const pdfBytes = await generateClaimPDF(policyAnalysis, damageInventory, disputeLetter, formSummary || {})

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="claimpilot-package.pdf"',
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `PDF generation failed: ${message}` }, { status: 500 })
  }
}
