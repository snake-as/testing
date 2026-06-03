'use client'

import { useState, useRef } from 'react'
import type { ClaimFormData, InsuranceType, DamageCause, ClaimStatus, LossAdjusterStatus } from '@/types/claim'

const INITIAL: ClaimFormData = {
  insuranceType: '',
  damageCause: '',
  damageDate: '',
  settlementOffered: '',
  estimatedLoss: '',
  claimStatus: '',
  damageDescription: '',
  lossAdjusterStatus: '',
  policyFile: null,
  damagePhotos: [],
}

type Step = 'uploads' | 'questions' | 'processing' | 'done'

export default function ClaimForm() {
  const [step, setStep] = useState<Step>('uploads')
  const [form, setForm] = useState<ClaimFormData>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    policyAnalysis: string
    damageInventory: string
    disputeLetter: string
  } | null>(null)
  const [globalError, setGlobalError] = useState('')
  const policyInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function setField<K extends keyof ClaimFormData>(key: K, value: ClaimFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      const n = { ...e }
      delete n[key]
      return n
    })
  }

  // Smoothly advance the progress bar toward `target` over time.
  // Stops itself when it reaches the target. Always clears any existing timer first.
  function animateProgressTo(target: number, intervalMs = 2800) {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 4, target)
        if (next >= target && progressTimerRef.current) {
          clearInterval(progressTimerRef.current)
          progressTimerRef.current = null
        }
        return next
      })
    }, intervalMs)
  }

  function stopProgressTimer() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  function validateUploads() {
    const e: Record<string, string> = {}
    if (!form.policyFile) e.policyFile = 'Please upload your insurance policy PDF.'
    return e
  }

  function validateQuestions() {
    const e: Record<string, string> = {}
    if (!form.insuranceType) e.insuranceType = 'Please select an insurance type.'
    if (!form.damageCause) e.damageCause = 'Please select the damage cause.'
    if (!form.damageDate) e.damageDate = 'Please enter the damage date.'
    if (form.settlementOffered === '') e.settlementOffered = 'Please enter a value (use 0 if no offer yet).'
    if (form.estimatedLoss === '') e.estimatedLoss = 'Please enter your estimated loss.'
    if (!form.claimStatus) e.claimStatus = 'Please select your claim status.'
    if (!form.damageDescription || form.damageDescription.length < 50)
      e.damageDescription = 'Please describe the damage in at least 50 characters.'
    if (!form.lossAdjusterStatus) e.lossAdjusterStatus = 'Please select a loss adjuster status.'
    return e
  }

  async function handleProcess() {
    const e = validateQuestions()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setStep('processing')
    setProgress(10)
    setGlobalError('')

    try {
      // Step 1: Extract policy PDF text
      setProgress(20)
      const pdfForm = new FormData()
      pdfForm.append('file', form.policyFile!)
      const extractRes = await fetch('/api/extract-pdf', { method: 'POST', body: pdfForm })
      const extractData = await extractRes.json()
      if (!extractRes.ok) throw new Error(extractData.error || 'Failed to extract PDF text.')

      // Step 2: Run AI processing — this takes 30–60 seconds.
      // Start animating from 40 → 85 slowly so the UI stays alive.
      setProgress(40)
      animateProgressTo(85)

      const processRes = await fetch('/api/process-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            insuranceType: form.insuranceType,
            damageCause: form.damageCause,
            damageDate: form.damageDate,
            settlementOffered: form.settlementOffered,
            estimatedLoss: form.estimatedLoss,
            claimStatus: form.claimStatus,
            damageDescription: form.damageDescription,
            lossAdjusterStatus: form.lossAdjusterStatus,
          },
          policyText: extractData.text,
          photoFilenames: form.damagePhotos.map((f) => f.name),
        }),
      })

      stopProgressTimer()
      const processData = await processRes.json()
      if (!processRes.ok) throw new Error(processData.error || 'AI processing failed.')

      setProgress(95)
      setResult(processData)
      setStep('done')
    } catch (err) {
      stopProgressTimer()
      setGlobalError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setStep('questions')
    }
  }

  async function handleDownload() {
    if (!result) return

    const insuranceLabels: Record<string, string> = {
      home: 'Home insurance',
      contents: 'Contents insurance',
      business: 'Business property',
      other: 'Other',
    }
    const damageLabels: Record<string, string> = {
      flood: 'Flood',
      fire: 'Fire',
      storm: 'Storm damage',
      theft: 'Theft',
      escape_of_water: 'Escape of water',
      subsidence: 'Subsidence',
      other: 'Other',
    }
    const statusLabels: Record<string, string> = {
      open_no_offer: 'Claim open — no offer yet',
      low_offer: 'Offer too low',
      rejected: 'Claim rejected',
      reopen: 'Reopening settlement',
    }

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          formSummary: {
            insuranceType: insuranceLabels[form.insuranceType] ?? form.insuranceType,
            damageCause: damageLabels[form.damageCause] ?? form.damageCause,
            damageDate: form.damageDate,
            settlementOffered: String(form.settlementOffered),
            estimatedLoss: String(form.estimatedLoss),
            claimStatus: statusLabels[form.claimStatus] ?? form.claimStatus,
          },
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'PDF generation failed.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'claimpilot-package.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'PDF download failed.')
    }
  }

  if (step === 'processing') return <ProcessingScreen progress={progress} />

  if (step === 'done' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a2744] mb-2">Your package is ready</h2>
          <p className="text-gray-600 mb-6">
            Your claim documentation package has been generated and is ready to download.
          </p>
          {globalError && <p className="text-red-600 text-sm mb-4">{globalError}</p>}
          <button onClick={handleDownload} className="btn-primary w-full text-lg py-4 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"
              />
            </svg>
            Download PDF Package
          </button>
          <button
            onClick={() => {
              setForm(INITIAL)
              setResult(null)
              setStep('uploads')
              setErrors({})
              setGlobalError('')
            }}
            className="btn-secondary w-full"
          >
            Start a new claim
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <details className="card cursor-pointer">
            <summary className="font-semibold text-[#1a2744] select-none">
              Preview: Policy Coverage Analysis
            </summary>
            <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{result.policyAnalysis}</div>
          </details>
          <details className="card cursor-pointer">
            <summary className="font-semibold text-[#1a2744] select-none">Preview: Damage Inventory</summary>
            <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{result.damageInventory}</div>
          </details>
          <details className="card cursor-pointer">
            <summary className="font-semibold text-[#1a2744] select-none">Preview: Dispute Letter</summary>
            <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{result.disputeLetter}</div>
          </details>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8 px-4">
          ClaimPilot is a document preparation service. It does not constitute legal, financial, or
          regulated insurance advice.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step progress indicator */}
      <div className="flex items-center mb-8">
        {['Upload documents', 'Answer questions'].map((label, i) => {
          const active = (i === 0 && step === 'uploads') || (i === 1 && step === 'questions')
          const done = i === 0 && step === 'questions'
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    done
                      ? 'bg-green-500 text-white'
                      : active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    active ? 'text-[#1a2744]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
          {globalError}
        </div>
      )}

      {step === 'uploads' && (
        <UploadStep
          form={form}
          errors={errors}
          policyInputRef={policyInputRef}
          photoInputRef={photoInputRef}
          setField={setField}
          onNext={() => {
            const e = validateUploads()
            if (Object.keys(e).length) {
              setErrors(e)
              return
            }
            setStep('questions')
          }}
        />
      )}

      {step === 'questions' && (
        <QuestionsStep
          form={form}
          errors={errors}
          setField={setField}
          onBack={() => setStep('uploads')}
          onSubmit={handleProcess}
        />
      )}
    </div>
  )
}

function ProcessingScreen({ progress }: { progress: number }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-blue-100 absolute" />
        <div className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent absolute animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-[#1a2744] mb-3">Building your claim package</h2>
      <p className="text-gray-500 mb-8">Analysing your policy and building your claim package&hellip;</p>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-3">{progress}%</p>
      <div className="mt-8 text-sm space-y-2">
        {progress >= 20 && <p className="text-green-600">✓ Policy PDF extracted</p>}
        {progress >= 40 && <p className="text-blue-600">● Analysing policy coverage…</p>}
        {progress >= 60 && <p className="text-blue-600">● Building damage inventory…</p>}
        {progress >= 75 && <p className="text-blue-600">● Drafting dispute letter…</p>}
        {progress >= 95 && <p className="text-green-600">✓ All sections complete</p>}
      </div>
    </div>
  )
}

interface UploadStepProps {
  form: ClaimFormData
  errors: Record<string, string>
  policyInputRef: React.RefObject<HTMLInputElement>
  photoInputRef: React.RefObject<HTMLInputElement>
  setField: <K extends keyof ClaimFormData>(key: K, value: ClaimFormData[K]) => void
  onNext: () => void
}

function UploadStep({ form, errors, policyInputRef, photoInputRef, setField, onNext }: UploadStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Upload your documents</h2>
        <p className="text-gray-500 text-sm">We need your insurance policy to analyse your coverage.</p>
      </div>

      {/* Policy PDF */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Insurance Policy PDF <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => policyInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center ${
            form.policyFile
              ? 'border-green-400 bg-green-50'
              : errors.policyFile
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          }`}
        >
          {form.policyFile ? (
            <div>
              <div className="text-green-600 font-semibold text-sm mb-1">{form.policyFile.name}</div>
              <div className="text-xs text-gray-500">
                {(form.policyFile.size / 1024 / 1024).toFixed(2)} MB &bull; Click to replace
              </div>
            </div>
          ) : (
            <div>
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click to upload your policy PDF</p>
              <p className="text-xs text-gray-400 mt-1">PDF only &bull; Max 10MB</p>
            </div>
          )}
          <input
            ref={policyInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              if (file.type !== 'application/pdf') {
                setErrors((prev) => ({ ...prev, policyFile: 'Only PDF files are accepted.' }))
                e.target.value = ''
                return
              }
              if (file.size > 10 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, policyFile: 'File must be under 10MB.' }))
                e.target.value = ''
                return
              }
              setField('policyFile', file)
            }}
          />
        </div>
        {errors.policyFile && <p className="text-red-600 text-xs mt-1">{errors.policyFile}</p>}
      </div>

      {/* Damage Photos */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Damage Photos{' '}
          <span className="text-gray-400 font-normal">(optional, up to 20)</span>
        </label>
        <div
          onClick={() => photoInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center border-gray-300 hover:border-blue-400 bg-gray-50"
        >
          {form.damagePhotos.length > 0 ? (
            <div>
              <div className="text-blue-600 font-semibold text-sm mb-1">
                {form.damagePhotos.length} photo{form.damagePhotos.length !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-gray-500">
                {form.damagePhotos
                  .map((f) => f.name)
                  .slice(0, 3)
                  .join(', ')}
                {form.damagePhotos.length > 3 ? ` +${form.damagePhotos.length - 3} more` : ''} &bull;
                Click to change
              </div>
            </div>
          ) : (
            <div>
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click to upload damage photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG / PNG &bull; Up to 20 images</p>
            </div>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).slice(0, 20)
              setField('damagePhotos', files)
            }}
          />
        </div>
      </div>

      <button onClick={onNext} className="btn-primary w-full text-lg py-4">
        Continue to questions
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

interface QuestionsStepProps {
  form: ClaimFormData
  errors: Record<string, string>
  setField: <K extends keyof ClaimFormData>(key: K, value: ClaimFormData[K]) => void
  onBack: () => void
  onSubmit: () => void
}

function QuestionsStep({ form, errors, setField, onBack, onSubmit }: QuestionsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Tell us about your claim</h2>
        <p className="text-gray-500 text-sm">Answer the questions below so we can build your package.</p>
      </div>

      <FieldGroup label="Q1. What type of insurance is this?" error={errors.insuranceType} required>
        <RadioGroup
          name="insuranceType"
          value={form.insuranceType}
          onChange={(v) => setField('insuranceType', v as InsuranceType)}
          options={[
            { value: 'home', label: 'Home insurance' },
            { value: 'contents', label: 'Contents insurance' },
            { value: 'business', label: 'Business property' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </FieldGroup>

      <FieldGroup label="Q2. What caused the damage?" error={errors.damageCause} required>
        <RadioGroup
          name="damageCause"
          value={form.damageCause}
          onChange={(v) => setField('damageCause', v as DamageCause)}
          options={[
            { value: 'flood', label: 'Flood' },
            { value: 'fire', label: 'Fire' },
            { value: 'storm', label: 'Storm damage' },
            { value: 'theft', label: 'Theft' },
            { value: 'escape_of_water', label: 'Escape of water' },
            { value: 'subsidence', label: 'Subsidence' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </FieldGroup>

      <FieldGroup label="Q3. When did the damage occur?" error={errors.damageDate} required>
        <input
          type="date"
          value={form.damageDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setField('damageDate', e.target.value)}
          className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.damageDate ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </FieldGroup>

      <FieldGroup
        label="Q4. What settlement amount has your insurer offered? (€)"
        error={errors.settlementOffered}
        required
        hint="Enter 0 if no offer has been made yet."
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
          <input
            type="number"
            min={0}
            value={form.settlementOffered === '' ? '' : String(form.settlementOffered)}
            onChange={(e) =>
              setField('settlementOffered', e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="0"
            className={`w-full border rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.settlementOffered ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Q5. What do you estimate the total value of your loss to be? (€)"
        error={errors.estimatedLoss}
        required
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
          <input
            type="number"
            min={0}
            value={form.estimatedLoss === '' ? '' : String(form.estimatedLoss)}
            onChange={(e) =>
              setField('estimatedLoss', e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="0"
            className={`w-full border rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estimatedLoss ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Q6. What is the current status of your claim?"
        error={errors.claimStatus}
        required
      >
        <RadioGroup
          name="claimStatus"
          value={form.claimStatus}
          onChange={(v) => setField('claimStatus', v as ClaimStatus)}
          options={[
            { value: 'open_no_offer', label: 'Claim open — no offer yet' },
            { value: 'low_offer', label: 'Received an offer I think is too low' },
            { value: 'rejected', label: 'Claim has been rejected' },
            { value: 'reopen', label: 'Settlement accepted but I want to reopen it' },
          ]}
        />
      </FieldGroup>

      <FieldGroup
        label="Q7. Describe what was damaged and how it happened"
        error={errors.damageDescription}
        required
        hint={`Minimum 50 characters. ${form.damageDescription.length} entered.`}
      >
        <textarea
          value={form.damageDescription}
          onChange={(e) => setField('damageDescription', e.target.value)}
          rows={5}
          placeholder="Describe the damage in detail. What was affected? How did it happen? What is the current state?"
          className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.damageDescription ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </FieldGroup>

      <FieldGroup
        label="Q8. Has an insurer-appointed loss adjuster visited yet?"
        error={errors.lossAdjusterStatus}
        required
      >
        <RadioGroup
          name="lossAdjusterStatus"
          value={form.lossAdjusterStatus}
          onChange={(v) => setField('lossAdjusterStatus', v as LossAdjusterStatus)}
          options={[
            { value: 'not_yet', label: 'No, not yet' },
            { value: 'visited', label: 'Yes, they visited' },
            { value: 'visited_disagreed', label: 'Yes and I disagreed with their assessment' },
          ]}
        />
      </FieldGroup>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button onClick={onSubmit} className="btn-primary flex-1 text-lg py-4">
          Generate My Package
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        By generating your package you agree to our{' '}
        <a href="/terms" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}

function FieldGroup({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
            value === opt.value
              ? 'border-blue-600 bg-blue-50 text-blue-900'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-blue-600 flex-shrink-0"
          />
          <span className="text-sm font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}
