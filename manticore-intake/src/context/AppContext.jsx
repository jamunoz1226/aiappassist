import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [tier, setTier] = useState(null)         // 2 | 5 | 10
  const [messages, setMessages] = useState([])   // { role: 'ai' | 'user', text: string }[]
  const [summary, setSummary] = useState(null)   // structured JSON from Gemini
  const [submissionId, setSubmissionId] = useState(null)

  function resetIntake() {
    setTier(null)
    setMessages([])
    setSummary(null)
    setSubmissionId(null)
  }

  return (
    <AppContext.Provider value={{
      tier, setTier,
      messages, setMessages,
      summary, setSummary,
      submissionId, setSubmissionId,
      resetIntake,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
