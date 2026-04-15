import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Confirm() {
  const { submissionId, mode, resetIntake } = useApp()
  const navigate = useNavigate()

  const isFeedback = mode === 'feedback'

  function handleStartNew() {
    resetIntake()
    navigate('/')
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-screen px-4 py-12 max-w-md mx-auto w-full text-center">

      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl mb-6">
        ✓
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">You&apos;re all set!</h1>
      <p className="text-slate-400 text-base leading-relaxed mb-6">
        {isFeedback
          ? "Your feedback has been sent to the Manticore team. We'll review it and follow up with you shortly."
          : "Your intake has been sent to the Manticore team. We'll review your details and be in touch soon."}
      </p>

      {submissionId && (
        <div className="mb-8 px-5 py-3 bg-slate-900 rounded-xl border border-slate-800 w-full">
          <p className="text-xs text-slate-500 mb-1">Your reference ID</p>
          <p className="font-mono text-amber-400 text-sm font-semibold">{submissionId}</p>
        </div>
      )}

      <div className="w-full space-y-3">
        <div className="px-5 py-4 bg-slate-900 rounded-xl border border-slate-800 text-left">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">What happens next</p>
          {isFeedback ? (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">1.</span> Our team reviews your feedback (usually within 1 business day)</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">2.</span> We&apos;ll prioritize and action the changes you flagged</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">3.</span> We&apos;ll reach out to walk you through the updates</li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">1.</span> Our team reviews your intake (usually within 1–2 business days)</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">2.</span> We&apos;ll reach out to schedule a discovery call</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">3.</span> We start designing your perfect website</li>
            </ul>
          )}
        </div>

        <button
          onClick={handleStartNew}
          className="w-full py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors"
        >
          {isFeedback ? 'Back to home' : 'Start a new intake'}
        </button>
      </div>

      <p className="mt-8 text-xs text-slate-600">
        Questions? Reach out at <span className="text-slate-400">hello@manticore.com</span>
      </p>
    </div>
  )
}
