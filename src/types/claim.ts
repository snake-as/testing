export type InsuranceType = 'home' | 'contents' | 'business' | 'other'
export type DamageCause = 'flood' | 'fire' | 'storm' | 'theft' | 'escape_of_water' | 'subsidence' | 'other'
export type ClaimStatus = 'open_no_offer' | 'low_offer' | 'rejected' | 'reopen'
export type LossAdjusterStatus = 'not_yet' | 'visited' | 'visited_disagreed'

export interface ClaimFormData {
  insuranceType: InsuranceType | ''
  damageCause: DamageCause | ''
  damageDate: string
  settlementOffered: number | ''
  estimatedLoss: number | ''
  claimStatus: ClaimStatus | ''
  damageDescription: string
  lossAdjusterStatus: LossAdjusterStatus | ''
  policyFile: File | null
  damagePhotos: File[]
}

export interface ProcessingResult {
  policyAnalysis: string
  damageInventory: string
  disputeLetter: string
}

export interface ApiProcessRequest {
  formData: Omit<ClaimFormData, 'policyFile' | 'damagePhotos'>
  policyText: string
  photoFilenames: string[]
}
