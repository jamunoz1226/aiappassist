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
      // Send both so the textarea can show interim results in real time
      onTranscript(final || interim, event.results[event.results.length - 1].isFinal)
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
