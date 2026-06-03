import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib'

const NAVY = rgb(0.102, 0.153, 0.267) // #1a2744
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
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function addFooter(page: PDFPage, font: PDFFont, pageNum: number) {
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
  page.drawText(`Page ${pageNum}`, { x: width - 55, y: 30, size: 7, font, color: GREY })
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

  cover.drawRectangle({ x: 0, y: pageHeight - 180, width: pageWidth, height: 180, color: NAVY })
  cover.drawText('ClaimPilot', { x: margin, y: pageHeight - 70, size: 32, font: fontBold, color: WHITE })
  cover.drawText('Insurance Claim Package', {
    x: margin,
    y: pageHeight - 110,
    size: 18,
    font: fontRegular,
    color: rgb(0.75, 0.82, 0.95),
  })

  const today = new Date().toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  cover.drawText(`Prepared: ${today}`, {
    x: margin,
    y: pageHeight - 145,
    size: 10,
    font: fontRegular,
    color: rgb(0.65, 0.75, 0.9),
  })

  // Summary box
  cover.drawRectangle({ x: margin, y: pageHeight - 370, width: contentWidth, height: 160, color: LIGHT_GREY })
  cover.drawText('Claim Summary', { x: margin + 16, y: pageHeight - 240, size: 12, font: fontBold, color: NAVY })

  const summaryItems: [string, string][] = [
    ['Insurance Type', formSummary.insuranceType ?? ''],
    ['Damage Cause', formSummary.damageCause ?? ''],
    ['Damage Date', formSummary.damageDate ?? ''],
    ['Settlement Offered', `€${formSummary.settlementOffered ?? '0'}`],
    ['Estimated Loss', `€${formSummary.estimatedLoss ?? '0'}`],
    ['Claim Status', formSummary.claimStatus ?? ''],
  ]

  let sy = pageHeight - 265
  for (const [label, value] of summaryItems) {
    cover.drawText(`${label}:`, { x: margin + 16, y: sy, size: 9, font: fontBold, color: GREY })
    cover.drawText(value || '-', { x: margin + 160, y: sy, size: 9, font: fontRegular, color: BLACK })
    sy -= 16
  }

  // Contents list
  cover.drawText('Contents', { x: margin, y: pageHeight - 420, size: 14, font: fontBold, color: NAVY })
  let cy = pageHeight - 445
  for (const item of ['1. Policy Coverage Analysis', '2. Damage Inventory', '3. Formal Dispute Letter']) {
    cover.drawText(item, { x: margin + 16, y: cy, size: 11, font: fontRegular, color: BLACK })
    cy -= 22
  }

  // Disclaimer box
  cover.drawRectangle({ x: margin, y: 80, width: contentWidth, height: 62, color: rgb(0.99, 0.97, 0.94) })
  cover.drawText('Important Notice', {
    x: margin + 12,
    y: 128,
    size: 9,
    font: fontBold,
    color: rgb(0.6, 0.4, 0),
  })
  const disclaimerText =
    'ClaimPilot is a document preparation service. It does not constitute legal, financial, or regulated insurance advice. For regulated advice, consult a qualified solicitor, public loss adjuster, or licensed insurance professional.'
  let dy = 114
  for (const dl of splitTextIntoLines(disclaimerText, contentWidth - 24, fontRegular, 8)) {
    cover.drawText(dl, { x: margin + 12, y: dy, size: 8, font: fontRegular, color: GREY })
    dy -= 11
  }

  addFooter(cover, fontRegular, 1)

  // --- SECTION PAGES ---
  // pageNum is mutable across sections so page numbers are continuous
  let pageNum = 2

  function addSection(sectionNum: number, sectionTitle: string, content: string) {
    // Create the first page for this section with the large navy header
    let page = doc.addPage([pageWidth, pageHeight])
    page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: NAVY })
    page.drawText(`Section ${sectionNum}`, {
      x: margin,
      y: pageHeight - 38,
      size: 11,
      font: fontRegular,
      color: rgb(0.65, 0.75, 0.9),
    })
    page.drawText(sectionTitle, { x: margin, y: pageHeight - 60, size: 18, font: fontBold, color: WHITE })
    let y = pageHeight - 105

    // When y drops too low, seal the current page and open a fresh one.
    // `page` and `y` are reassigned here — this is intentional mutable tracking.
    function nextPage() {
      addFooter(page, fontRegular, pageNum)
      pageNum++
      page = doc.addPage([pageWidth, pageHeight])
      page.drawRectangle({ x: 0, y: pageHeight - 28, width: pageWidth, height: 28, color: NAVY })
      page.drawText(`${sectionTitle} (continued)`, {
        x: margin,
        y: pageHeight - 18,
        size: 9,
        font: fontRegular,
        color: rgb(0.75, 0.82, 0.95),
      })
      y = pageHeight - 46
    }

    for (const rawLine of content.split('\n')) {
      const isHeading =
        /^#{1,3} /.test(rawLine) ||
        /^[A-Z][A-Z ]{4,}:?$/.test(rawLine) ||
        rawLine.startsWith('**')
      const cleanLine = rawLine.replace(/^#{1,3} /, '').replace(/\*\*/g, '').trim()

      if (!cleanLine) {
        y -= 7
        continue
      }

      if (isHeading) {
        const wrapped = splitTextIntoLines(cleanLine, contentWidth, fontBold, 11)
        // Ensure a heading + at least one body line fits before starting it
        if (y - wrapped.length * 16 - 14 < 65) nextPage()
        y -= 4
        for (const wl of wrapped) {
          page.drawText(wl, { x: margin, y, size: 11, font: fontBold, color: NAVY })
          y -= 16
        }
        y -= 4
      } else {
        for (const wl of splitTextIntoLines(cleanLine, contentWidth, fontRegular, 10)) {
          if (y < 65) nextPage()
          page.drawText(wl, { x: margin, y, size: 10, font: fontRegular, color: BLACK })
          y -= 14
        }
      }
    }

    addFooter(page, fontRegular, pageNum)
    pageNum++
  }

  addSection(1, 'Policy Coverage Analysis', policyAnalysis)
  addSection(2, 'Damage Inventory', damageInventory)
  addSection(3, 'Formal Dispute Letter', disputeLetter)

  return doc.save()
}
