import { Routes, Route, Navigate } from 'react-router-dom'
import Gateway from './screens/Gateway.jsx'
import Welcome from './screens/Welcome.jsx'
import Prebrief from './screens/Prebrief.jsx'
import FeedbackWelcome from './screens/FeedbackWelcome.jsx'
import FeedbackPrebrief from './screens/FeedbackPrebrief.jsx'
import Chat from './screens/Chat.jsx'
import Summary from './screens/Summary.jsx'
import Confirm from './screens/Confirm.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Gateway />} />
        <Route path="/intake" element={<Welcome />} />
        <Route path="/prebrief" element={<Prebrief />} />
        <Route path="/feedback" element={<FeedbackWelcome />} />
        <Route path="/feedback/prebrief" element={<FeedbackPrebrief />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
