import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

// Generic editable field row
function Field({ label, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const display = value ?? '—'

  function commit() {
    onChange(draft)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 w-36 shrink-0 pt-0.5">{label}</span>
      {editing ? (
        <div className="flex flex-1 gap-2">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commit()}
            className="flex-1 bg-slate-800 border border-amber-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none"
          />
          <button onClick={commit} className="text-xs text-amber-400 hover:text-amber-300 shrink-0">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-300 shrink-0">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value ?? ''); setEditing(true) }}
          className="flex-1 text-left text-sm text-slate-200 hover:text-amber-300 transition-colors group"
        >
          {Array.isArray(display) ? display.join(', ') : String(display)}
          <span className="ml-2 text-xs text-slate-600 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">✎ edit</span>
        </button>
      )}
    </div>
  )
}

// Section card wrapper
function Section({ title, children }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function Summary() {
  const { summary, setSummary, tier, setSubmissionId } = useApp()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!tier) {
    navigate('/')
    return null
  }

  // Fallback if summary generation failed
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-screen gap-4 px-4 text-center">
        <p className="text-slate-400 text-sm">We couldn&apos;t generate a structured summary. Your answers were still recorded.</p>
        <button onClick={() => navigate('/chat')} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm">
          Go back to chat
        </button>
      </div>
    )
  }

  function updateField(path, value) {
    setSummary(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let cursor = next
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] }
        cursor = cursor[keys[i]]
      }
      cursor[keys[keys.length - 1]] = value
      return next
    })
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/.netlify/functions/send-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, tier }),
      })

      // #region agent log
      fetch('http://127.0.0.1:7653/ingest/5874b0f7-a75e-4738-8e0d-c79217ecb465',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'975e86'},body:JSON.stringify({sessionId:'975e86',location:'Summary.jsx:101',message:'fetch response received',data:{status:res.status,ok:res.ok,url:res.url},runId:'run1',hypothesisId:'H-A',timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        // #region agent log
        fetch('http://127.0.0.1:7653/ingest/5874b0f7-a75e-4738-8e0d-c79217ecb465',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'975e86'},body:JSON.stringify({sessionId:'975e86',location:'Summary.jsx:106',message:'fetch failed - error path',data:{status:res.status,bodyMsg:body?.message??null},runId:'run1',hypothesisId:'H-B',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw new Error(body.message || `Server error ${res.status}`)
      }

      const data = await res.json()
      setSubmissionId(data.id ?? `MC-${Date.now()}`)
      navigate('/confirm')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const s = summary

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Your intake summary</h2>
        <p className="text-slate-400 text-sm">Review everything before we send it. Tap any field to edit it inline.</p>
      </div>

      <Section title="Business Info">
        <Field label="Business name" value={s.businessInfo?.name} onChange={v => updateField('businessInfo.name', v)} />
        <Field label="Type / industry" value={s.businessInfo?.type} onChange={v => updateField('businessInfo.type', v)} />
        <Field label="Location" value={s.businessInfo?.location} onChange={v => updateField('businessInfo.location', v)} />
        <Field label="Contact info" value={s.businessInfo?.contact} onChange={v => updateField('businessInfo.contact', v)} />
        <Field label="Current website" value={s.currentWebsite} onChange={v => updateField('currentWebsite', v)} />
      </Section>

      <Section title="Goals & Audience">
        <Field label="Primary goal" value={s.primaryGoal} onChange={v => updateField('primaryGoal', v)} />
        <Field label="Target customer" value={s.targetCustomer} onChange={v => updateField('targetCustomer', v)} />
        <Field label="Unique value" value={s.uniqueValue} onChange={v => updateField('uniqueValue', v)} />
      </Section>

      <Section title="Design Preferences">
        <Field label="Vibe / style" value={s.designPreferences?.vibe} onChange={v => updateField('designPreferences.vibe', v)} />
        <Field label="Colors" value={s.designPreferences?.colors} onChange={v => updateField('designPreferences.colors', v)} />
        <Field label="Has logo?" value={s.designPreferences?.logo} onChange={v => updateField('designPreferences.logo', v)} />
        <Field
          label="Inspiration URLs"
          value={Array.isArray(s.designPreferences?.inspirationUrls) ? s.designPreferences.inspirationUrls.join(', ') : s.designPreferences?.inspirationUrls}
          onChange={v => updateField('designPreferences.inspirationUrls', v.split(',').map(x => x.trim()))}
        />
      </Section>

      <Section title="Features & Pages">
        <Field
          label="Features needed"
          value={Array.isArray(s.featuresNeeded) ? s.featuresNeeded.join(', ') : s.featuresNeeded}
          onChange={v => updateField('featuresNeeded', v.split(',').map(x => x.trim()))}
        />
        <Field
          label="Pages"
          value={Array.isArray(s.pages) ? s.pages.join(', ') : s.pages}
          onChange={v => updateField('pages', v.split(',').map(x => x.trim()))}
        />
        <Field
          label="Integrations"
          value={Array.isArray(s.integrations) ? s.integrations.join(', ') : s.integrations}
          onChange={v => updateField('integrations', v.split(',').map(x => x.trim()))}
        />
      </Section>

      <Section title="Content & Assets">
        <Field label="Has photos?" value={s.contentAssets?.hasPhotos} onChange={v => updateField('contentAssets.hasPhotos', v)} />
        <Field label="Has logo file?" value={s.contentAssets?.hasLogo} onChange={v => updateField('contentAssets.hasLogo', v)} />
        <Field label="Has copy/text?" value={s.contentAssets?.hasCopy} onChange={v => updateField('contentAssets.hasCopy', v)} />
      </Section>

      <Section title="Timeline, Budget & Notes">
        <Field label="Timeline" value={s.timeline} onChange={v => updateField('timeline', v)} />
        <Field label="Budget range" value={s.budget} onChange={v => updateField('budget', v)} />
        <Field label="Maintenance plan" value={s.maintenancePlan} onChange={v => updateField('maintenancePlan', v)} />
        <Field label="Additional notes" value={s.additionalNotes} onChange={v => updateField('additionalNotes', v)} />
      </Section>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-xl text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending…' : 'Looks good — send it to Manticore →'}
        </button>
        <button
          onClick={() => navigate('/chat')}
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors disabled:opacity-50"
        >
          I want to add more
        </button>
      </div>
    </div>
  )
}
