import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = { title: 'Terms of Service — ClaimPilot' }

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: June 2025</p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">1. Service description</h2>
          <p className="text-gray-700 mb-4">
            ClaimPilot is a document preparation service. We help you organise and present your insurance claim
            information in a professional format. We are not a law firm, insurance broker, loss adjuster, or regulated
            financial adviser.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">2. Not legal or insurance advice</h2>
          <p className="text-gray-700 mb-4">
            Nothing produced by ClaimPilot constitutes legal advice, regulated insurance advice, or a guarantee of any
            claim outcome. Documents are prepared based on information you provide and are intended to help you
            communicate clearly with your insurer. For regulated advice, consult a solicitor, public loss adjuster, or
            licensed insurance professional.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">3. Accuracy of information</h2>
          <p className="text-gray-700 mb-4">
            You are responsible for the accuracy and completeness of all information you provide. ClaimPilot relies
            entirely on what you submit. We cannot verify claims, inspect damage, or validate policy terms independently.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">4. No guarantee of outcome</h2>
          <p className="text-gray-700 mb-4">
            Using ClaimPilot does not guarantee any particular insurance settlement outcome. Claim decisions are made
            solely by your insurer. We make no representations about the likelihood of claim success.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">5. Payment and refunds</h2>
          <p className="text-gray-700 mb-4">
            Payment is a one-time fee per claim package. Due to the digital nature of the product, refunds are not
            available once your package has been generated and downloaded.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">6. Limitation of liability</h2>
          <p className="text-gray-700 mb-4">
            ClaimPilot’s liability is limited to the amount paid for the service. We are not liable for any indirect,
            consequential, or incidental losses arising from use of this service.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">7. Governing law</h2>
          <p className="text-gray-700">
            These terms are governed by the laws of Ireland. Disputes will be subject to the jurisdiction of Irish courts.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
