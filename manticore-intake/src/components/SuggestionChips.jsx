export default function SuggestionChips({ chips, onSelect, disabled }) {
  if (!chips || chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-500 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
