import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = { title: 'Privacy Policy — ClaimPilot' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: June 2025</p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">1. Information we collect</h2>
          <p className="text-gray-700 mb-4">
            When you use ClaimPilot, you upload an insurance policy PDF and optionally damage photos. You also provide
            answers to questions about your claim. We collect this information solely to generate your claim documentation
            package.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">2. How we use your information</h2>
          <p className="text-gray-700 mb-4">
            Your uploaded documents and form answers are processed temporarily to generate your PDF package. We use the
            Anthropic Claude AI API to analyse your policy and generate documents. Data is transmitted securely.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">3. Data retention</h2>
          <p className="text-gray-700 mb-4">
            We do not permanently store your uploaded files, policy text, or personal claim details on our servers.
            Documents are processed in memory and discarded after your package is generated. We do not maintain a database
            of claim information.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">4. Third-party services</h2>
          <p className="text-gray-700 mb-4">
            We use Anthropic’s API for AI processing. Your policy text and claim details are sent to Anthropic for
            processing. Please review Anthropic’s privacy policy at anthropic.com. We use Vercel for hosting.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">5. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use only essential cookies required for the application to function. We do not use tracking or advertising
            cookies.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">6. Your rights</h2>
          <p className="text-gray-700 mb-4">
            As we do not retain personal data after processing, there is no stored data to access, correct, or delete.
            If you have questions, contact us.
          </p>

          <h2 className="text-xl font-bold text-[#1a2744] mt-8 mb-3">7. Contact</h2>
          <p className="text-gray-700">
            For privacy enquiries, please contact us via the contact details on our website.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
