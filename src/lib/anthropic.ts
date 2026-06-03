import Anthropic from '@anthropic-ai/sdk'
import { ApiProcessRequest } from '@/types/claim'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-6'

export async function analyzePolicyCoverage(
  policyText: string,
  damageDescription: string,
  damageType: string,
  insuranceType: string
): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are an expert insurance claim analyst. Analyse the provided insurance policy document and identify:
1. what is covered relevant to the described damage type,
2. the exact policy language that supports the claim,
3. any exclusions that could be used against the claimant,
4. the claims process and timeframes specified in the policy.

Write in plain English. Be specific and cite policy sections where possible.
Format your response with clear headings.
Do not provide legal or regulated insurance advice.`,
    messages: [
      {
        role: 'user',
        content: `Insurance Type: ${insuranceType}
Damage Type: ${damageType}
Damage Description: ${damageDescription}

Policy Document:
${policyText.slice(0, 15000)}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from AI')
  return content.text
}

export async function buildDamageInventory(
  damageDescription: string,
  damageCause: string,
  insuranceType: string,
  photoFilenames: string[]
): Promise<string> {
  const photoInfo =
    photoFilenames.length > 0
      ? `\n\nPhotos provided: ${photoFilenames.join(', ')}`
      : '\n\nNo photos provided.'

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are a professional claims documentation assistant preparing a damage inventory for a claimant.

Based on the information provided, create a professional, detailed damage inventory document.

For each damaged item or area:
- list the item or area,
- describe the damage specifically,
- note the likely cause,
- flag whether it may require repair, replacement, or further professional inspection.

Use professional but understandable insurance claim language.
Be thorough.
Format as a structured inventory list.
Do not exaggerate or invent damage that was not described.`,
    messages: [
      {
        role: 'user',
        content: `Insurance Type: ${insuranceType}
Damage Cause: ${damageCause}
Damage Description: ${damageDescription}${photoInfo}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from AI')
  return content.text
}

export async function generateDisputeLetter(
  request: ApiProcessRequest,
  policyAnalysis: string,
  damageInventory: string
): Promise<string> {
  const { formData } = request

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
  const claimStatusLabels: Record<string, string> = {
    open_no_offer: 'Claim open — no offer yet',
    low_offer: 'Received an offer I think is too low',
    rejected: 'Claim has been rejected',
    reopen: 'Settlement accepted but I want to reopen it',
  }
  const lossAdjusterLabels: Record<string, string> = {
    not_yet: 'No loss adjuster has visited yet',
    visited: 'A loss adjuster has visited',
    visited_disagreed: 'A loss adjuster visited and I disagreed with their assessment',
  }

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are a professional document preparation assistant helping a policyholder prepare a formal insurance claim dispute letter.

Write a formal but non-aggressive dispute letter from the policyholder to their insurer.

The letter should:
- reference their policy and claim professionally,
- state clearly that the settlement offered does not reflect the full extent of loss,
- reference the documented evidence,
- request a reassessment or escalation,
- request a written response within 14 days,
- be firm, factual, and professional.

Do not make up specific claim numbers or policy numbers.
Use placeholders:
[CLAIM REFERENCE]
[POLICY NUMBER]
[INSURER NAME]
[POLICYHOLDER NAME]

Do not provide legal or regulated insurance advice.`,
    messages: [
      {
        role: 'user',
        content: `Insurance Type: ${insuranceTypeLabels[formData.insuranceType] ?? formData.insuranceType}
Damage Cause: ${damageCauseLabels[formData.damageCause] ?? formData.damageCause}
Damage Date: ${formData.damageDate}
Settlement Offered: €${formData.settlementOffered ?? 0}
Estimated Loss: €${formData.estimatedLoss ?? 0}
Claim Status: ${claimStatusLabels[formData.claimStatus] ?? formData.claimStatus}
Loss Adjuster Status: ${lossAdjusterLabels[formData.lossAdjusterStatus] ?? formData.lossAdjusterStatus}
Damage Description: ${formData.damageDescription}

Policy Analysis Summary:
${policyAnalysis.slice(0, 3000)}

Damage Inventory Summary:
${damageInventory.slice(0, 3000)}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from AI')
  return content.text
}
