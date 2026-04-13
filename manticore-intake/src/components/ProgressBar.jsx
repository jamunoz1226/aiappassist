const TIER_LABELS = { 2: 'Quick Snapshot', 5: 'Full Picture', 10: 'Deep Dive' }

export default function ProgressBar({ current, total, tier }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0

  return (
    <div className="px-4 py-3 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{TIER_LABELS[tier]}</span>
        <span>Question {Math.min(current, total)} of {total}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
