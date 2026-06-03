import { NextRequest, NextResponse } from 'next/server'
import { analyzePolicyCoverage, buildDamageInventory, generateDisputeLetter } from '@/lib/anthropic'
import { ApiProcessRequest } from '@/types/claim'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body: ApiProcessRequest = await req.json()
    const { formData, policyText, photoFilenames } = body

    if (!policyText || policyText.trim().length < 50) {
      return NextResponse.json({ error: 'Policy text is too short or missing.' }, { status: 400 })
    }
    if (!formData.damageDescription || formData.damageDescription.length < 50) {
      return NextResponse.json({ error: 'Damage description must be at least 50 characters.' }, { status: 400 })
    }

    const insuranceTypeLabels: Record<string, string> = {
      home: 'Home insurance',
      contents: 'Contents insurance',
      business: 'Business property',
      other: 'Other',
    }
    const damageCauseLabels: Record<string, string> = {
      flood: 'Flood',
      fire: 'Fire',
      storm: 'Storm damage',
      theft: 'Theft',
      escape_of_water: 'Escape of water',
      subsidence: 'Subsidence',
      other: 'Other',
    }

    const insuranceLabel = insuranceTypeLabels[formData.insuranceType] || formData.insuranceType
    const damageLabel = damageCauseLabels[formData.damageCause] || formData.damageCause

    const [policyAnalysis, damageInventory] = await Promise.all([
      analyzePolicyCoverage(policyText, formData.damageDescription, damageLabel, insuranceLabel),
      buildDamageInventory(formData.damageDescription, damageLabel, insuranceLabel, photoFilenames),
    ])

    const disputeLetter = await generateDisputeLetter(
      { formData, policyText, photoFilenames },
      policyAnalysis,
      damageInventory
    )

    return NextResponse.json({ policyAnalysis, damageInventory, disputeLetter })
  } catch (err) {
    console.error('Process claim error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Processing failed: ${message}` }, { status: 500 })
  }
}
