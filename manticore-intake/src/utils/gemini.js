import { GoogleGenAI } from '@google/genai'

let client = null

function getClient() {
  if (!client) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.')
    }
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

/**
 * Send a message to Gemini and stream the response.
 * @param {string} systemPrompt
 * @param {Array<{role: 'ai'|'user', text: string}>} messages
 * @param {function(string): void} onChunk  - called with each streamed text chunk
 * @returns {Promise<string>}  - resolves with the full response text
 */
export async function streamChatMessage(systemPrompt, messages, onChunk) {
  const ai = getClient()

  // Convert our internal message format to Gemini's format
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'ai' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }))

  const lastMessage = messages[messages.length - 1]

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: systemPrompt },
    history,
  })

  let full = ''
  const stream = await chat.sendMessageStream({ message: lastMessage.text })

  for await (const chunk of stream) {
    const text = chunk.text ?? ''
    full += text
    onChunk(text)
  }

  return full
}

/**
 * One-shot structured call for generating the summary JSON.
 */
export async function generateSummary(prompt) {
  const ai = getClient()
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })
  return response.text
}
