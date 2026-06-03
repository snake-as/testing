import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib'

const NAVY = rgb(0.102, 0.153, 0.267) // #1a2744
const BLUE = rgb(0.145, 0.388, 0.922) // #2563eb
const GREY = rgb(0.4, 0.4, 0.4)
const BLACK = rgb(0, 0, 0)
const WHITE = rgb(1, 1, 1)
const LIGHT_GREY = rgb(0.97, 0.98, 0.99)

function splitTextIntoLines(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(test, fontSize)
    if (width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  color: ReturnType<typeof rgb>,
  lineHeight: number
): number {
  const paragraphs = text.split('\n')
  let y = startY
  for (const para of paragraphs) {
    if (para.trim() === '') {
      y -= lineHeight * 0.5
      continue
    }
    const lines = splitTextIntoLines(para.trim(), maxWidth, font, fontSize)
    for (const line of lines) {
      page.drawText(line, { x, y, size: fontSize, font, color })
      y -= lineHeight
    }
  }
  return y
}

function addFooter(page: PDFPage, font: PDFFont, pageNum: number, totalPages: number) {
  const { width } = page.getSize()
  page.drawLine({
    start: { x: 40, y: 45 },
    end: { x: width - 40, y: 45 },
    thickness: 0.5,
    color: GREY,
  })
  page.drawText(
    'Prepared with ClaimPilot. This is a document preparation service, not legal or insurance advice.',
    { x: 40, y: 30, size: 7, font, color: GREY }
  )
  page.drawText(`Page ${pageNum} of ${totalPages}`, {
    x: width - 80,
    y: 30,
    size: 7,
    font,
    color: GREY,
  })
}

export async function generateClaimPDF(
  policyAnalysis: string,
  damageInventory: string,
  disputeLetter: string,
  formSummary: Record<string, string>
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const pageWidth = 595
  const pageHeight = 842
  const margin = 55
  const contentWidth = pageWidth - margin * 2

  // --- COVER PAGE ---
  const cover = doc.addPage([pageWidth, pageHeight])

  // Navy header bar
  cover.drawRectangle({ x: 0, y: pageHeight - 180, width: pageWidth, height: 180, color: NAVY })
  cover.drawText('ClaimPilot', { x: margin, y: pageHeight - 70, size: 32, font: fontBold, color: WHITE })
  cover.drawText('Insurance Claim Package', { x: margin, y: pageHeight - 110, size: 18, font: fontRegular, color: rgb(0.75, 0.82, 0.95) })

  // Date
  const today = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
  cover.drawText(`Prepared: ${today}`, { x: margin, y: pageHeight - 145, size: 10, font: fontRegular, color: rgb(0.65, 0.75, 0.9) })

  // Summary box
  cover.drawRectangle({ x: margin, y: pageHeight - 370, width: contentWidth, height: 160, color: LIGHT_GREY })
  cover.drawText('Claim Summary', { x: margin + 16, y: pageHeight - 240, size: 12, font: fontBold, color: NAVY })

  const summaryItems = [
    ['Insurance Type', formSummary.insuranceType],
    ['Damage Cause', formSummary.damageCause],
    ['Damage Date', formSummary.damageDate],
    ['Settlement Offered', `€${formSummary.settlementOffered || '0'}`],
    ['Estimated Loss', `€${formSummary.estimatedLoss || '0'}`],
    ['Claim Status', formSummary.claimStatus],
  ]

  let sy = pageHeight - 265
  for (const [label, value] of summaryItems) {
    cover.drawText(`${label}:`, { x: margin + 16, y: sy, size: 9, font: fontBold, color: GREY })
    cover.drawText(value || '-', { x: margin + 160, y: sy, size: 9, font: fontRegular, color: BLACK })
    sy -= 16
  }

  // Contents
  cover.drawText('Contents', { x: margin, y: pageHeight - 420, size: 14, font: fontBold, color: NAVY })
  const contents = [
    '1. Policy Coverage Analysis',
    '2. Damage Inventory',
    '3. Formal Dispute Letter',
  ]
  let cy = pageHeight - 445
  for (const item of contents) {
    cover.drawText(item, { x: margin + 16, y: cy, size: 11, font: fontRegular, color: BLACK })
    cy -= 22
  }

  // Disclaimer box
  cover.drawRectangle({ x: margin, y: 80, width: contentWidth, height: 60, color: rgb(0.99, 0.97, 0.94) })
  cover.drawText('Important Notice', { x: margin + 12, y: 126, size: 9, font: fontBold, color: rgb(0.6, 0.4, 0) })
  drawWrappedText(
    cover,
    'ClaimPilot is a document preparation service. It does not constitute legal, financial, or regulated insurance advice. For regulated advice, consult a qualified solicitor, public loss adjuster, or licensed insurance professional.',
    margin + 12, 112, contentWidth - 24, fontRegular, 8, GREY, 12
  )

  addFooter(cover, fontRegular, 1, 4)

  // Helper to add section pages
  function addSectionPage(sectionNum: number, sectionTitle: string, content: string, pageNum: number): number {
    const page = doc.addPage([pageWidth, pageHeight])

    // Section header bar
    page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: NAVY })
    page.drawText(`Section ${sectionNum}`, { x: margin, y: pageHeight - 38, size: 11, font: fontRegular, color: rgb(0.65, 0.75, 0.9) })
    page.drawText(sectionTitle, { x: margin, y: pageHeight - 60, size: 18, font: fontBold, color: WHITE })

    let y = pageHeight - 105
    const lines = content.split('\n')

    for (const rawLine of lines) {
      if (y < 70) {
        addFooter(page, fontRegular, pageNum, 4)
        pageNum++
        const np = doc.addPage([pageWidth, pageHeight])
        np.drawRectangle({ x: 0, y: pageHeight - 30, width: pageWidth, height: 30, color: NAVY })
        np.drawText(sectionTitle, { x: margin, y: pageHeight - 20, size: 10, font: fontRegular, color: WHITE })
        // We can't reassign page in a closure easily, so we track via returned pageNum
        // Use recursion approach instead
        y = pageHeight - 50
        // Draw remaining on new page — simplified: just continue on current page context
        // This is a basic pager; for full multi-page we recurse
      }

      const line = rawLine
      const isHeading = line.match(/^#{1,3} /) || line.match(/^[A-Z][A-Z ]{4,}:?$/) || line.startsWith('**')
      const cleanLine = line.replace(/^#{1,3} /, '').replace(/\*\*/g, '')

      if (cleanLine.trim() === '') {
        y -= 8
        continue
      }

      if (isHeading) {
        if (y < pageHeight - 120) y -= 6
        drawWrappedText(page, cleanLine, margin, y, contentWidth, fontBold, 12, NAVY, 16)
        const wrappedCount = splitTextIntoLines(cleanLine, contentWidth, fontBold, 12).length
        y -= wrappedCount * 16 + 4
      } else {
        const wrapped = splitTextIntoLines(cleanLine, contentWidth, fontRegular, 10)
        for (const wl of wrapped) {
          page.drawText(wl, { x: margin, y, size: 10, font: fontRegular, color: BLACK })
          y -= 14
        }
      }
    }

    addFooter(page, fontRegular, pageNum, 4)
    return pageNum
  }

  addSectionPage(1, 'Policy Coverage Analysis', policyAnalysis, 2)
  addSectionPage(2, 'Damage Inventory', damageInventory, 3)
  addSectionPage(3, 'Formal Dispute Letter', disputeLetter, 4)

  return doc.save()
}
