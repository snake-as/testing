import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L13 4V9C13 12 8 15 8 15C8 15 3 12 3 9V4L8 1Z" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M6 8L7.5 9.5L10 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-[#1a2744] text-lg">ClaimPilot</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
          <Link href="/#how-it-works" className="hover:text-gray-800 transition-colors">How it works</Link>
          <Link href="/#pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
          <Link href="/claim" className="btn-primary !py-2 !text-sm">Start My Claim</Link>
        </nav>
        <Link href="/claim" className="sm:hidden btn-primary !py-2 !text-sm">Start</Link>
      </div>
    </header>
  )
}
