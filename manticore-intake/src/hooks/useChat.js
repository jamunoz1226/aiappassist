import { useState, useCallback } from 'react'
import { streamChatMessage } from '../utils/gemini.js'
import {
  buildSystemPrompt, QUESTION_BANKS,
  buildFeedbackSystemPrompt, FEEDBACK_QUESTION_BANKS,
} from '../utils/prompts.js'

const INTAKE_COMPLETE_SIGNAL = '[INTAKE_COMPLETE]'

function parseGeminiError(err) {
  // #region agent log
  console.error('[DBG-5b1d79] parseGeminiError called', {errMessage: err?.message, errCauseMessage: err?.cause?.message, errKeys: Object.keys(err ?? {}), errStringified: JSON.stringify(err)?.slice(0, 400)})
  // #endregion
  const msg = err.message ?? ''
  const causeMsg = err.cause?.message ?? ''
  const full = msg + ' ' + causeMsg + ' ' + JSON.stringify(err)
  const is429 = full.includes('429') || full.includes('RESOURCE_EXHAUSTED') || full.includes('quota')
  // #region agent log
  console.error('[DBG-5b1d79] is429 check', {is429, msgSnippet: msg.slice(0, 200), causeMsgSnippet: causeMsg.slice(0, 200)})
  // #endregion
  if (is429) {
    const match = full.match(/retry.*?(\d+)s/i) ?? full.match(/(\d+)s/)
    if (match) {
      return `We've hit the daily AI limit. Please wait about ${match[1]} seconds and try again, or come back tomorrow.`
    }
    return "We've hit the daily AI limit. Please try again in a few minutes, or come back tomorrow."
  }
  return 'Something went wrong. Please try again.'
}

export function useChat(tier, onIntakeComplete, mode = 'intake') {
  const [messages, setMessages] = useState([])
  const [chips, setChips] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)

  const questionBanks = mode === 'feedback' ? FEEDBACK_QUESTION_BANKS : QUESTION_BANKS
  const totalQuestions = questionBanks[tier]?.length ?? 5

  /**
   * Parse AI response to extract message text and suggestion chips.
   * Format: "message text\n\nCHIPS: ["a","b","c"]"
   */
  function parseAiResponse(raw) {
    const chipsMatch = raw.match(/CHIPS:\s*(\[.*?\])/s)
    let parsedChips = []
    let text = raw

    if (chipsMatch) {
      try {
        parsedChips = JSON.parse(chipsMatch[1])
      } catch {
        parsedChips = []
      }
      text = raw.replace(/CHIPS:\s*\[.*?\]/s, '').trim()
    }

    // Strip the intake complete signal from display text
    const isComplete = text.includes(INTAKE_COMPLETE_SIGNAL)
    text = text.replace(INTAKE_COMPLETE_SIGNAL, '').trim()

    return { text, chips: parsedChips, isComplete }
  }

  /**
   * Initialize the chat — send the system prompt and get the first question.
   */
  const startChat = useCallback(async () => {
    if (isLoading || messages.length > 0) return
    setIsLoading(true)

    const systemPrompt = mode === 'feedback' ? buildFeedbackSystemPrompt(tier) : buildSystemPrompt(tier)

    // Seed with a silent "start" message so Gemini asks question 1
    const seed = [{ role: 'user', text: 'Hello, I\'m ready to get started.' }]

    try {
      let fullResponse = ''
      setMessages([...seed, { role: 'ai', text: '' }])

      await streamChatMessage(systemPrompt, seed, (chunk) => {
        fullResponse += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', text: fullResponse }
          return updated
        })
      })

      const { text, chips: newChips, isComplete } = parseAiResponse(fullResponse)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'ai', text }
        return updated
      })
      setChips(newChips)
      setQuestionIndex(1)

      if (isComplete) onIntakeComplete([...seed, { role: 'ai', text }])
    } catch (err) {
      // #region agent log
      console.error('[DBG-5b1d79] startChat catch fired', {errMessage: err?.message?.slice(0, 300)})
      // #endregion
      setMessages([{ role: 'ai', text: parseGeminiError(err) }])
    } finally {
      setIsLoading(false)
    }
  }, [tier, mode, isLoading, messages.length, onIntakeComplete])

  /**
   * Send a user message and stream the AI reply.
   */
  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isLoading) return

    const userMsg = { role: 'user', text: userText.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages([...updatedMessages, { role: 'ai', text: '' }])
    setIsLoading(true)
    setChips([])

    const systemPrompt = mode === 'feedback' ? buildFeedbackSystemPrompt(tier) : buildSystemPrompt(tier)

    try {
      let fullResponse = ''

      await streamChatMessage(systemPrompt, updatedMessages, (chunk) => {
        fullResponse += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', text: fullResponse }
          return updated
        })
      })

      const { text, chips: newChips, isComplete } = parseAiResponse(fullResponse)
      const finalMessages = [...updatedMessages, { role: 'ai', text }]

      setMessages(finalMessages)
      setChips(newChips)
      setQuestionIndex(prev => Math.min(prev + 1, totalQuestions))

      if (isComplete) onIntakeComplete(finalMessages)
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: parseGeminiError(err) },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, tier, mode, totalQuestions, onIntakeComplete])

  return {
    messages,
    chips,
    isLoading,
    questionIndex,
    totalQuestions,
    startChat,
    sendMessage,
  }
}
