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
      // #region agent log
      fetch('http://127.0.0.1:7653/ingest/5874b0f7-a75e-4738-8e0d-c79217ecb465',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2dd59d'},body:JSON.stringify({sessionId:'2dd59d',location:'useVoice.js:36',message:'onresult fired',data:{resultIndex:event.resultIndex,resultsLength:event.results.length,final,interim,computedIsFinal:event.results[event.results.length-1].isFinal},timestamp:Date.now(),hypothesisId:'H-B,H-C'})}).catch(()=>{})
      // #endregion
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
