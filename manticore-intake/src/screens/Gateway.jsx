import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Gateway() {
  const { setMode } = useApp()
  const navigate = useNavigate()

  function handleIntake() {
    setMode('intake')
    navigate('/intake')
  }

  function handleFeedback() {
    setMode('feedback')
    navigate('/feedback')
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-3xl mx-auto w-full min-h-screen">

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
          Welcome to Manticore
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto animate-fade-up animate-delay-150">
          What brings you here today?
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid gap-5 w-full sm:grid-cols-2 animate-fade-up animate-delay-300">

        {/* Intake card */}
        <button
          onClick={handleIntake}
          className="group relative flex flex-col text-left p-7 rounded-2xl border border-amber-500 bg-slate-900 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl mb-5">
            💡
          </div>
          <p className="text-xl font-semibold text-white mb-2">I have a website idea</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Tell us about your business and what you need — we'll ask the right questions to get started on your new site.
          </p>
          <div className="mt-auto text-sm font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
            Start intake survey →
          </div>
        </button>

        {/* Feedback card */}
        <button
          onClick={handleFeedback}
          className="group relative flex flex-col text-left p-7 rounded-2xl border border-sky-500 bg-slate-900 hover:bg-sky-500/10 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-2xl mb-5">
            🔍
          </div>
          <p className="text-xl font-semibold text-white mb-2">I want to review my site</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Your site is live — now share your thoughts. We'll walk you through a structured review so we can refine it together.
          </p>
          <div className="mt-auto text-sm font-medium text-sky-400 group-hover:text-sky-300 transition-colors">
            Start feedback survey →
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-slate-600">
        No login required · Your answers go directly to the Manticore team
      </p>
    </div>
  )
}
