import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const TIERS = [
  {
    minutes: 2,
    label: 'Quick Snapshot',
    description: 'Just the essentials — perfect if you\'re short on time.',
    topics: [
      'Business name & what you do',
      'Current website (if any)',
      '#1 goal for your new site',
      'Sites you love for inspiration',
      'Best contact method',
    ],
    accent: 'border-sky-500 hover:bg-sky-500/10',
    badge: 'bg-sky-500/20 text-sky-300',
    check: 'text-sky-400',
  },
  {
    minutes: 5,
    label: 'Full Picture',
    description: 'A well-rounded overview — the sweet spot for most clients.',
    topics: [
      'Everything in the 2-min tier',
      'Your ideal customer',
      'What makes you different',
      'Features needed (booking, shop…)',
      'Logo, brand colors, vibe',
      'Photos & page needs',
    ],
    accent: 'border-amber-500 hover:bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-300',
    check: 'text-amber-400',
    popular: true,
  },
  {
    minutes: 10,
    label: 'Deep Dive',
    description: 'The full picture — great for complex businesses or big visions.',
    topics: [
      'Everything in the 5-min tier',
      'Competitor analysis',
      'Existing content & integrations',
      'Timeline & budget range',
      'Ongoing maintenance plan',
      'Anything else on your mind',
    ],
    accent: 'border-violet-500 hover:bg-violet-500/10',
    badge: 'bg-violet-500/20 text-violet-300',
    check: 'text-violet-400',
  },
]

export default function Welcome() {
  const { setTier } = useApp()
  const navigate = useNavigate()

  function handleSelect(minutes) {
    setTier(minutes)
    navigate('/prebrief')
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-3xl mx-auto w-full">

      {/* Header / Branding */}
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-4 animate-fade-down">
          <img
            src="/images/lm-icon.png"
            alt="Manticore"
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>
        <h1 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight animate-fade-up animate-delay-150">
          Let&apos;s design your perfect website
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto animate-fade-up animate-delay-150">
          We&apos;d love to learn about your business. Pick how much time you have and we&apos;ll ask the right questions.
        </p>
      </div>

      {/* Brand image strip */}
      <div className="relative w-full mb-8 rounded-2xl overflow-hidden animate-fade-in animate-delay-300" style={{ maxHeight: '200px' }}>
        <img
            src="/images/logo.png"
          alt=""
          aria-hidden="true"
          className="w-full object-cover sm:max-h-[280px] max-h-[200px]"
          style={{ maxHeight: '200px' }}
        />
        <div className="absolute inset-0 bg-slate-950/30 rounded-2xl" />
      </div>

      {/* Back Navigation */}
      <button
        onClick={() => navigate('/')}
        className="self-start text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back
      </button>

      {/* Tier Cards */}
      <div className="grid gap-4 w-full sm:grid-cols-3">
        {TIERS.map((tier, index) => (
          <button
            key={tier.minutes}
            onClick={() => handleSelect(tier.minutes)}
            className={`relative flex flex-col text-left p-5 rounded-2xl border bg-slate-900 transition-all duration-200 cursor-pointer group animate-fade-up animate-delay-${450 + index * 100} ${tier.accent}`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-amber-500 text-slate-950 px-3 py-1 rounded-full">
                Most popular
              </span>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.badge}`}>
                ~{tier.minutes} min
              </span>
            </div>

            <p className="text-lg font-semibold text-white mb-1">{tier.label}</p>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{tier.description}</p>

            <ul className="space-y-1.5 mt-auto">
              {tier.topics.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.check}`} />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-5 text-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
              <span className="inline-flex items-center gap-1">Select <ArrowRight className="w-4 h-4" /></span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-600">
        No login required · Your answers go directly to the Lumoz team
      </p>
    </div>
  )
}
