// Netlify serverless function — receives structured intake JSON and emails it.
// Environment variables needed in Netlify dashboard:
//   RESEND_API_KEY  — from resend.com
//   TO_EMAIL        — your email address (e.g. jay@manticore.com)
//   FROM_EMAIL      — a verified sender domain on Resend (e.g. intake@manticore.com)

const TIER_LABELS = { 2: 'Quick Snapshot (2 min)', 5: 'Full Picture (5 min)', 10: 'Deep Dive (10 min)' }

function val(v) {
  if (v === null || v === undefined || v === '') return '<em>Not provided</em>'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '<em>Not provided</em>'
  return String(v)
}

function buildHtml(summary, tier, id) {
  const s = summary
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    h1 { color: #0f172a; font-size: 22px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    h2 { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #d97706; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; vertical-align: top; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    td:first-child { color: #94a3b8; width: 160px; font-size: 12px; padding-right: 12px; }
    tr:last-child td { border-bottom: none; }
    .id { font-size: 11px; color: #94a3b8; margin-top: 20px; }
    .prompt-card { background: #fffbeb; border-color: #fcd34d; }
  </style>
</head>
<body>
  <h1>New Client Intake</h1>
  <div class="meta">Tier: ${TIER_LABELS[tier] ?? tier} &nbsp;·&nbsp; Submission ID: ${id}</div>

  <div class="card">
    <h2>Business Info</h2>
    <table>
      <tr><td>Business name</td><td>${val(s.businessInfo?.name)}</td></tr>
      <tr><td>Type / industry</td><td>${val(s.businessInfo?.type)}</td></tr>
      <tr><td>Location</td><td>${val(s.businessInfo?.location)}</td></tr>
      <tr><td>Contact info</td><td>${val(s.businessInfo?.contact)}</td></tr>
      <tr><td>Current website</td><td>${val(s.currentWebsite)}</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>Goals & Audience</h2>
    <table>
      <tr><td>Primary goal</td><td>${val(s.primaryGoal)}</td></tr>
      <tr><td>Target customer</td><td>${val(s.targetCustomer)}</td></tr>
      <tr><td>Unique value</td><td>${val(s.uniqueValue)}</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>Design Preferences</h2>
    <table>
      <tr><td>Vibe / style</td><td>${val(s.designPreferences?.vibe)}</td></tr>
      <tr><td>Colors</td><td>${val(s.designPreferences?.colors)}</td></tr>
      <tr><td>Has logo</td><td>${val(s.designPreferences?.logo)}</td></tr>
      <tr><td>Inspiration URLs</td><td>${val(s.designPreferences?.inspirationUrls)}</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>Features & Pages</h2>
    <table>
      <tr><td>Features needed</td><td>${val(s.featuresNeeded)}</td></tr>
      <tr><td>Pages needed</td><td>${val(s.pages)}</td></tr>
      <tr><td>Integrations</td><td>${val(s.integrations)}</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>Content Assets</h2>
    <table>
      <tr><td>Has photos</td><td>${val(s.contentAssets?.hasPhotos)}</td></tr>
      <tr><td>Has logo file</td><td>${val(s.contentAssets?.hasLogo)}</td></tr>
      <tr><td>Has copy / text</td><td>${val(s.contentAssets?.hasCopy)}</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>Timeline, Budget & Notes</h2>
    <table>
      <tr><td>Timeline</td><td>${val(s.timeline)}</td></tr>
      <tr><td>Budget range</td><td>${val(s.budget)}</td></tr>
      <tr><td>Maintenance plan</td><td>${val(s.maintenancePlan)}</td></tr>
      <tr><td>Additional notes</td><td>${val(s.additionalNotes)}</td></tr>
    </table>
  </div>

  ${s.ownerPrompt ? `<div class="card prompt-card">
    <h2>AI Project Brief — Copy &amp; Paste into Cursor / ChatGPT</h2>
    <p style="white-space: pre-wrap; font-family: monospace; font-size: 13px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; line-height: 1.6; color: #1e293b;">
      ${val(s.ownerPrompt)}
    </p>
  </div>` : ''}

  <p class="id">Sent via Manticore Client Intake PWA · ${new Date().toUTCString()}</p>
</body>
</html>`
}

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 })
  }

  const { RESEND_API_KEY, TO_EMAIL, FROM_EMAIL } = process.env

  if (!RESEND_API_KEY || !TO_EMAIL || !FROM_EMAIL) {
    return new Response(
      JSON.stringify({ message: 'Server is missing email configuration. Contact the site owner.' }),
      { status: 500 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON body' }), { status: 400 })
  }

  const { summary, tier } = body
  if (!summary) {
    return new Response(JSON.stringify({ message: 'Missing summary in request body' }), { status: 400 })
  }

  const id = `MC-${Date.now()}`
  const html = buildHtml(summary, tier, id)

  const emailPayload = {
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `New Client Intake — ${summary.businessInfo?.name ?? 'Unknown Business'} (${id})`,
    html,
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailPayload),
  })

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}))
    return new Response(
      JSON.stringify({ message: err.message ?? 'Failed to send email' }),
      { status: 502 }
    )
  }

  return new Response(JSON.stringify({ id }), { status: 200 })
}
