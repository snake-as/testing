import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClaimForm from '@/components/ClaimForm'

export const metadata = {
  title: 'Start My Claim Package — ClaimPilot',
  description: 'Upload your policy, answer 8 questions, and get a professional claim package.',
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Build Your Claim Package</h1>
          <p className="text-gray-500">Upload your policy, answer 8 questions, and download your professional PDF package.</p>
        </div>
        <ClaimForm />
      </main>
      <Footer />
    </div>
  )
}
