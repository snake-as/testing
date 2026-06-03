import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-gray-300 py-12 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="font-bold text-white text-lg mb-2">ClaimPilot</div>
            <p className="text-sm text-gray-400 max-w-xs">
              Professional insurance claim documentation. Not legal or insurance advice.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold mb-1">Legal</span>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold mb-1">Product</span>
              <Link href="/claim" className="hover:text-white transition-colors">Start a Claim</Link>
              <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
              <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-8 text-xs text-gray-500">
          <p>
            ClaimPilot is a document preparation service. It does not constitute legal, financial, or regulated insurance
            advice. For regulated advice, consult a qualified solicitor, public loss adjuster, or licensed insurance
            professional.
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} ClaimPilot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
