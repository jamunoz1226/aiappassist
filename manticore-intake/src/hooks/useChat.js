import { useState, useCallback } from 'react'
import { streamChatMessage } from '../utils/gemini.js'
import { buildSystemPrompt, QUESTION_BANKS } from '../utils/prompts.js'

const INTAKE_COMPLETE_SIGNAL = '[INTAKE_COMPLETE]'

/**
 * Manages the chat conversation with Gemini.
 */
export function useChat(tier, onIntakeComplete) {
  const [messages, setMessages] = useState([])
  const [chips, setChips] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)

  const totalQuestions = QUESTION_BANKS[tier]?.length ?? 5

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

    const systemPrompt = buildSystemPrompt(tier)

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
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: `Sorry, there was an error connecting to the AI. Please check your API key and try again.\n\n${err.message}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [tier, isLoading, messages.length, onIntakeComplete])

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

    const systemPrompt = buildSystemPrompt(tier)

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
        { role: 'ai', text: `Something went wrong. Please try again.\n\n${err.message}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, tier, totalQuestions, onIntakeComplete])

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
