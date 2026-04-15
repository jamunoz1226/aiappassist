import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const BRIEFS = {
  2: {
    heading: 'Quick Snapshot',
    body: "In just a few questions, we'll grab the core details about your business and what you need from your new website. This is fast, friction-free, and gives our team everything to get started.",
    count: '5 questions',
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
  },
  5: {
    heading: 'Full Picture',
    body: "We'll cover everything from your ideal customer and brand vibe to the features you need. By the end, our team will have a complete picture of your vision — no back-and-forth needed.",
    count: '12 questions',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  10: {
    heading: 'Deep Dive',
    body: "This is the full consultation — competitors, content, integrations, budget, timeline. When you're done, we'll have everything we need to design something truly built for your business.",
    count: '20 questions',
    color: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
  },
}

export default function Prebrief() {
  const { tier } = useApp()
  const navigate = useNavigate()

  // Guard: if someone lands here without selecting a tier, redirect
  if (!tier) {
    navigate('/intake')
    return null
  }

  const brief = BRIEFS[tier]

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 max-w-xl mx-auto w-full min-h-screen">

      {/* Back link */}
      <button
        onClick={() => navigate('/intake')}
        className="self-start text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back
      </button>

      {/* Card */}
      <div className={`w-full rounded-2xl border p-8 ${brief.border} ${brief.bg}`}>
        <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${brief.color}`}>
          {brief.heading} · {brief.count}
        </p>
        <h2 className="font-syne text-2xl font-bold text-white mb-4 leading-snug">
          Here&apos;s what we&apos;ll cover
        </h2>
        <p className="text-slate-300 text-base leading-relaxed mb-8">
          {brief.body}
        </p>

        <ul className="space-y-2 mb-8 text-sm text-slate-400">
          <li className="flex items-center gap-2"><Check className={`w-4 h-4 shrink-0 ${brief.color}`} /> One question at a time — no walls of text</li>
          <li className="flex items-center gap-2"><Check className={`w-4 h-4 shrink-0 ${brief.color}`} /> Type or use your mic — your choice</li>
          <li className="flex items-center gap-2"><Check className={`w-4 h-4 shrink-0 ${brief.color}`} /> Review and edit everything before we receive it</li>
        </ul>

        <button
          onClick={() => navigate('/chat')}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-base transition-colors"
        >
          <span className="inline-flex items-center gap-1.5">Let&apos;s go <ArrowRight className="w-4 h-4" /></span>
        </button>
      </div>
    </div>
  )
}
