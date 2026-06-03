import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-[#1a2744] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 text-sm px-3 py-1 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0L8.57 5H14L9.71 8.08L11.28 13L7 9.92L2.72 13L4.29 8.08L0 5H5.43L7 0Z" /></svg>
            Professional document preparation
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Your insurer has professionals.<br />
            <span className="text-blue-400">Now you have ClaimPilot.</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Turn your insurance policy, damage details, and photos into a professional claim documentation package in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/claim" className="btn-primary text-lg px-8 py-4">
              Start My Claim Package
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">€49 one-time &bull; No subscription &bull; Download instantly</p>
        </div>
      </section>

      {/* Problem */}
      <section className="section-grey py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2744] mb-4">Stop leaving money on the table</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Most policyholders submit claims with scattered photos, unclear descriptions, and no structured evidence.
            ClaimPilot helps you prepare a clear, professional package before you respond to your insurer.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2744] text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload your policy',
                desc: 'Upload your insurance policy PDF and any damage photos you have.',
              },
              {
                step: '2',
                title: 'Answer 8 questions',
                desc: 'Tell us about the damage, your claim status, and what your insurer has offered.',
              },
              {
                step: '3',
                title: 'Download your package',
                desc: 'We analyse your policy with AI and generate a professional PDF claim package.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-[#1a2744] text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-grey py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2744] text-center mb-12">What’s in your package</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '🔎',
                title: 'Policy Coverage Analysis',
                desc: 'We identify what your policy covers, the exact language that supports your claim, and any exclusions your insurer may use.',
              },
              {
                icon: '📋',
                title: 'Damage Inventory',
                desc: 'A structured, professional inventory of all damage — item by item, with repair vs. replacement recommendations.',
              },
              {
                icon: '📝',
                title: 'Formal Dispute Letter',
                desc: 'A firm, professional letter requesting reassessment or escalation, citing your evidence and requesting a written response.',
              },
              {
                icon: '📄',
                title: 'Downloadable PDF Package',
                desc: 'A clean, professional PDF ready to send to your insurer, broker, or financial ombudsman.',
              },
            ].map((f) => (
              <div key={f.title} className="card flex gap-4">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-[#1a2744] mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2744] mb-4">Simple, one-time pricing</h2>
          <p className="text-gray-600 mb-8">No subscription. No hidden fees. Pay once, download instantly.</p>
          <div className="card border-2 border-blue-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              One-time payment
            </div>
            <div className="text-5xl font-bold text-[#1a2744] mb-1">€49</div>
            <p className="text-gray-500 mb-6">per claim package</p>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Policy coverage analysis',
                'Full damage inventory',
                'Professional dispute letter',
                'Downloadable PDF package',
                'AI-powered in minutes',
                'No subscription required',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/claim" className="btn-primary w-full text-center text-lg py-4">Start My Claim Package</Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-grey py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            ClaimPilot is a document preparation service. It does not constitute legal, financial, or regulated insurance
            advice. For regulated advice, consult a qualified solicitor, public loss adjuster, or licensed insurance
            professional.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
