import { NextRequest, NextResponse } from 'next/server'
import { analyzePolicyCoverage, buildDamageInventory, generateDisputeLetter } from '@/lib/anthropic'
import { ApiProcessRequest } from '@/types/claim'

export const maxDuration = 60

const INSURANCE_TYPE_LABELS: Record<string, string> = {
  home: 'Home insurance',
  contents: 'Contents insurance',
  business: 'Business property',
  other: 'Other',
}
const DAMAGE_CAUSE_LABELS: Record<string, string> = {
  flood: 'Flood',
  fire: 'Fire',
  storm: 'Storm damage',
  theft: 'Theft',
  escape_of_water: 'Escape of water',
  subsidence: 'Subsidence',
  other: 'Other',
}

export async function POST(req: NextRequest) {
  try {
    const body: ApiProcessRequest = await req.json()
    const { formData, policyText, photoFilenames } = body

    // Validate policyText
    if (!policyText || typeof policyText !== 'string' || policyText.trim().length < 50) {
      return NextResponse.json({ error: 'Policy text is too short or missing.' }, { status: 400 })
    }
    if (policyText.length > 25000) {
      return NextResponse.json({ error: 'Policy text exceeds maximum length.' }, { status: 400 })
    }

    // Validate formData exists and is an object
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
    }

    // Validate all required fields
    const requiredFields = [
      'insuranceType',
      'damageCause',
      'damageDate',
      'claimStatus',
      'lossAdjusterStatus',
    ] as const
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    if (!formData.damageDescription || formData.damageDescription.length < 50) {
      return NextResponse.json(
        { error: 'Damage description must be at least 50 characters.' },
        { status: 400 }
      )
    }

    if (formData.settlementOffered === '' || formData.estimatedLoss === '') {
      return NextResponse.json(
        { error: 'Settlement offered and estimated loss must be provided.' },
        { status: 400 }
      )
    }

    const insuranceLabel = INSURANCE_TYPE_LABELS[formData.insuranceType] ?? formData.insuranceType
    const damageLabel = DAMAGE_CAUSE_LABELS[formData.damageCause] ?? formData.damageCause

    // Run policy analysis and damage inventory in parallel, then generate letter
    const [policyAnalysis, damageInventory] = await Promise.all([
      analyzePolicyCoverage(policyText, formData.damageDescription, damageLabel, insuranceLabel),
      buildDamageInventory(
        formData.damageDescription,
        damageLabel,
        insuranceLabel,
        Array.isArray(photoFilenames) ? photoFilenames : []
      ),
    ])

    const disputeLetter = await generateDisputeLetter(
      { formData, policyText, photoFilenames: Array.isArray(photoFilenames) ? photoFilenames : [] },
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
