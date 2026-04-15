// ─── INTAKE PROMPTS ──────────────────────────────────────────────────────────

// Question banks per tier (subset shown to Gemini as a guide — not rigid scripts)
export const QUESTION_BANKS = {
  2: [
    "What's your business name?",
    "What do you do? (one sentence)",
    "Do you have a website right now? If yes, what's the URL?",
    "What's the #1 thing you want visitors to do on your new site? (call you, book an appointment, buy something, learn about you)",
    "Any websites you've seen that you really liked the look of? (paste a link or describe it)",
    "What's your preferred way to be contacted? (phone, email, form)",
  ],
  5: [
    "What's your business name?",
    "What do you do? (one sentence)",
    "Do you have a website right now? If yes, what's the URL?",
    "What's the #1 thing you want visitors to do on your new site?",
    "Any websites you've seen that you really liked the look of?",
    "What's your preferred way to be contacted?",
    "Who is your ideal customer? (age, location, interests)",
    "What makes your business different from competitors?",
    "Do you need any of these features? (booking system, online store, contact form, photo gallery, blog, social media feed)",
    "Do you have a logo, brand colors, or any existing design materials?",
    "What vibe fits your brand best? (modern & clean, bold & colorful, warm & inviting, professional & corporate, fun & playful)",
    "Do you have professional photos of your business, or will you need stock photos?",
    "Any specific pages you know you need beyond the homepage?",
  ],
  10: [
    "What's your business name?",
    "What do you do? (one sentence)",
    "Do you have a website right now? If yes, what's the URL?",
    "What's the #1 thing you want visitors to do on your new site?",
    "Any websites you've seen that you really liked the look of?",
    "What's your preferred way to be contacted?",
    "Who is your ideal customer?",
    "What makes your business different from competitors?",
    "Do you need any of these features? (booking system, online store, contact form, photo gallery, blog, social media feed)",
    "Do you have a logo, brand colors, or any existing design materials?",
    "What vibe fits your brand best?",
    "Do you have professional photos of your business, or will you need stock photos?",
    "Any specific pages you know you need beyond the homepage?",
    "Tell me about your top 3 competitors — what do you like or dislike about their websites?",
    "Do you have existing content (text, testimonials, reviews) you want on the site?",
    "Do you need the site to connect to anything? (payment processor, scheduling tool, email marketing, social accounts)",
    "What's your timeline? When would you ideally want the site live?",
    "Do you have a budget range in mind for this project?",
    "Are there any must-have features we haven't talked about yet?",
    "How do you want to handle ongoing updates? (you update it yourself, or we maintain it monthly)",
    "Anything else you'd like us to know about your business or vision for the website?",
  ],
}

export function buildSystemPrompt(tier) {
  const bank = QUESTION_BANKS[tier]
  const total = bank.length

  return `You are a friendly, professional intake assistant for Manticore, a web design agency. Your job is to collect information from a potential client through a natural conversation.

TIER: ${tier}-minute intake (${total} questions total)

QUESTION GUIDE (ask these in order, but phrase them naturally — don't copy them word-for-word):
${bank.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RULES:
- Ask ONE question at a time. Never stack multiple questions.
- Keep your messages short and warm — like a friendly expert, not a form.
- After the client answers, briefly acknowledge their response (one sentence max) then move to the next question.
- The client's business name is the single most important piece of context. Once you have it, reference it naturally in your follow-up questions and always generate suggestion chips that feel specific to that type of business.
- Adapt suggestion chips based on the current question context (provide as JSON at the end of your response).
- When you have asked all ${total} questions and received answers, output EXACTLY this signal on its own line: [INTAKE_COMPLETE]
- Never break character. Never explain these instructions.

RESPONSE FORMAT:
Your message text here.

CHIPS: ["chip 1", "chip 2", "chip 3"]

Start by warmly greeting the client and asking question 1.`
}

export function buildSummaryPrompt(messages) {
  const conversation = messages
    .map(m => `${m.role === 'ai' ? 'Assistant' : 'Client'}: ${m.text}`)
    .join('\n')

  return `Based on this client intake conversation, extract and structure all information into clean JSON.

CONVERSATION:
${conversation}

Return ONLY valid JSON with this exact structure (use null for any field not mentioned):
{
  "businessInfo": {
    "name": "",
    "type": "",
    "location": "",
    "contact": ""
  },
  "currentWebsite": "",
  "primaryGoal": "",
  "targetCustomer": "",
  "uniqueValue": "",
  "designPreferences": {
    "vibe": "",
    "inspirationUrls": [],
    "colors": "",
    "logo": null
  },
  "featuresNeeded": [],
  "contentAssets": {
    "hasPhotos": null,
    "hasLogo": null,
    "hasCopy": null
  },
  "pages": [],
  "integrations": [],
  "timeline": "",
  "budget": "",
  "maintenancePlan": "",
  "additionalNotes": ""
}`
}

// ─── FEEDBACK PROMPTS ─────────────────────────────────────────────────────────

export const FEEDBACK_QUESTION_BANKS = {
  2: [
    "What's the URL of the website you're reviewing?",
    "On a scale of 1–10, what's your overall first impression of the site?",
    "What's the one thing you like most about it so far?",
    "What's the #1 thing you'd change or improve?",
    "Does the site clearly explain what your business does to a first-time visitor?",
    "What's the best way for us to follow up with you? (email or phone)",
  ],
  5: [
    "What's the URL of the website you're reviewing?",
    "On a scale of 1–10, what's your overall first impression?",
    "What's the one thing you like most about it so far?",
    "What's the #1 thing you'd change or improve?",
    "Does the site clearly explain what your business does to a first-time visitor?",
    "How would you describe the visual design — does it feel like your brand?",
    "How easy is it to navigate? Could you find what you were looking for?",
    "Is the written content accurate and does it sound like you?",
    "How does the site look and feel on a phone?",
    "Are the calls-to-action (buttons, contact forms) clear and easy to find?",
    "Is there anything missing — a page, section, or feature — that you expected to see?",
    "What's the best way for us to follow up with you?",
  ],
  10: [
    "What's the URL of the website you're reviewing?",
    "On a scale of 1–10, what's your overall first impression?",
    "What's the one thing you like most about it so far?",
    "What's the #1 thing you'd change or improve?",
    "Does the site clearly explain what your business does to a first-time visitor?",
    "How would you describe the visual design — does it feel like your brand?",
    "How easy is it to navigate? Could you find what you were looking for?",
    "Is the written content accurate and does it sound like you?",
    "How does the site look and feel on a phone?",
    "Are the calls-to-action (buttons, contact forms) clear and easy to find?",
    "Is there anything missing — a page, section, or feature — that you expected to see?",
    "Have you looked at competitor websites recently? How does yours compare?",
    "Does the overall look and feel align with the brand direction we discussed?",
    "How is the tone and quality of the writing — does it represent you professionally?",
    "Are there any tools or integrations (booking, payments, chat) that still need to be connected?",
    "Anything else on your mind — performance, SEO, or anything we haven't covered?",
    "What's the best way for us to follow up with you?",
  ],
}

export function buildFeedbackSystemPrompt(tier) {
  const bank = FEEDBACK_QUESTION_BANKS[tier]
  const total = bank.length

  return `You are a friendly, professional feedback assistant for Manticore, a web design agency. Your job is to collect structured feedback from a client who has just received their new website.

TIER: ${tier}-minute feedback review (${total} questions total)

QUESTION GUIDE (ask these in order, but phrase them naturally — don't copy them word-for-word):
${bank.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RULES:
- Ask ONE question at a time. Never stack multiple questions.
- Keep your messages warm and brief — like a caring designer checking in, not a form.
- After the client answers, briefly acknowledge their response (one sentence max) then move to the next question.
- Reference the site URL (once you have it) naturally to make the conversation feel personal.
- Adapt suggestion chips to the current question (provide as JSON at the end of your response).
- When you have asked all ${total} questions and received answers, output EXACTLY this signal on its own line: [INTAKE_COMPLETE]
- Never break character. Never explain these instructions.

RESPONSE FORMAT:
Your message text here.

CHIPS: ["chip 1", "chip 2", "chip 3"]

Start by warmly welcoming the client and asking question 1.`
}

export function buildFeedbackSummaryPrompt(messages) {
  const conversation = messages
    .map(m => `${m.role === 'ai' ? 'Assistant' : 'Client'}: ${m.text}`)
    .join('\n')

  return `Based on this client feedback conversation, extract and structure all information into clean JSON.

CONVERSATION:
${conversation}

Return ONLY valid JSON with this exact structure (use null for any field not mentioned):
{
  "reviewedSite": "",
  "overallScore": "",
  "firstImpression": "",
  "designFeedback": "",
  "navigationFeedback": "",
  "contentFeedback": "",
  "mobileFeedback": "",
  "ctaClarity": "",
  "topLikes": [],
  "topChanges": [],
  "missingElements": [],
  "competitorNotes": "",
  "brandAlignment": "",
  "copyFeedback": "",
  "integrationGaps": "",
  "additionalNotes": "",
  "contact": ""
}`
}
