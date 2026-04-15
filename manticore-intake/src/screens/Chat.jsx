import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useChat } from '../hooks/useChat.js'
import { useVoice } from '../hooks/useVoice.js'
import { generateSummary } from '../utils/gemini.js'
import { buildSummaryPrompt, buildFeedbackSummaryPrompt } from '../utils/prompts.js'
import ChatBubble from '../components/ChatBubble.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import SuggestionChips from '../components/SuggestionChips.jsx'

export default function Chat() {
  const { tier, mode, setMessages: setGlobalMessages, setSummary } = useApp()
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  if (!tier) {
    navigate(mode === 'feedback' ? '/feedback' : '/intake')
    return null
  }

  // Called when Gemini signals all questions are done
  const handleIntakeComplete = useCallback(async (finalMessages) => {
    setGlobalMessages(finalMessages)
    setIsGeneratingSummary(true)

    try {
      const prompt = mode === 'feedback'
        ? buildFeedbackSummaryPrompt(finalMessages)
        : buildSummaryPrompt(finalMessages)
      const rawJson = await generateSummary(prompt)

      // Strip markdown code fences if Gemini wraps JSON in them
      const clean = rawJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(clean)

      setSummary(parsed)
      navigate('/summary')
    } catch (err) {
      console.error('Summary generation failed:', err)
      // Still navigate — Summary screen handles null gracefully
      setSummary(null)
      navigate('/summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [setGlobalMessages, setSummary, navigate])

  const { messages, chips, isLoading, questionIndex, totalQuestions, startChat, sendMessage } = useChat(tier, handleIntakeComplete, mode)

  // Tracks only finalized speech segments so interim previews never double-count
  const committedTextRef = useRef('')

  // Handle voice transcript updates
  const handleTranscript = useCallback((text, isFinal) => {
    if (isFinal) {
      committedTextRef.current += text + ' '
      setInputText(committedTextRef.current)
    } else {
      setInputText(committedTextRef.current + text)
    }
  }, [])

  const { isListening, startListening, stopListening, supported: voiceSupported } = useVoice(handleTranscript)

  // Start the chat on mount
  useEffect(() => {
    startChat()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (isListening) stopListening()
    if (!inputText.trim()) return
    sendMessage(inputText.trim())
    setInputText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChipSelect(chip) {
    setInputText(chip)
    textareaRef.current?.focus()
  }

  function toggleMic() {
    if (isListening) {
      stopListening()
    } else {
      committedTextRef.current = ''
      setInputText('')
      startListening()
    }
  }

  if (isGeneratingSummary) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-screen gap-4 text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Putting together your summary…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto w-full">
      {/* Back button — navigates to /prebrief without resetting tier or messages */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={() => navigate(mode === 'feedback' ? '/feedback/prebrief' : '/prebrief')}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors text-left"
          style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Change survey length
        </button>
      </div>

      <ProgressBar current={questionIndex} total={totalQuestions} tier={tier} />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.filter(m => m.role !== 'user' || m.text !== "Hello, I'm ready to get started.").map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      <SuggestionChips chips={chips} onSelect={handleChipSelect} disabled={isLoading} />

      {/* Input bar */}
      <div className="px-4 pb-6 pt-2 border-t border-slate-800 bg-slate-950">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening…' : 'Type your answer…'}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl bg-slate-800 border border-slate-700 focus:border-amber-500 focus:outline-none px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />

          {/* Mic button */}
          {voiceSupported && (
            <button
              onClick={toggleMic}
              disabled={isLoading}
              title={isListening ? 'Stop recording' : 'Start voice input'}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${
                isListening
                  ? 'bg-red-500 mic-pulse text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 flex items-center justify-center shrink-0 text-slate-950 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
