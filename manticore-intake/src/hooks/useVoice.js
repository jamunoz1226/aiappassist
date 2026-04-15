import { useState, useRef, useCallback } from 'react'

/**
 * Wraps the browser's Web Speech API.
 * Returns { isListening, startListening, stopListening, supported }
 */
export function useVoice(onTranscript) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const supported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  const startListening = useCallback(() => {
    if (!supported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      // isFinal is derived from whether any finalized text was produced in this
      // batch — not from the position of the last result, which can be interim
      // even when earlier results in the same batch are already final.
      const text = final || interim
      const isFinal = final.length > 0
      onTranscript(text, isFinal)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }, [supported, onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, startListening, stopListening, supported }
}
