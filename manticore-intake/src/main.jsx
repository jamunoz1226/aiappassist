import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'
import './index.css'

// Register the service worker for PWA / offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('SW registration failed:', err)
    })
  })
}

// #region agent log
console.error('[DBG c6ed96][main.jsx:17][H-C] App boot — path at mount:', window.location.pathname);
fetch('http://127.0.0.1:7653/ingest/5874b0f7-a75e-4738-8e0d-c79217ecb465',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6ed96'},body:JSON.stringify({sessionId:'c6ed96',location:'main.jsx:17',message:'App boot — path at mount',data:{path:window.location.pathname},timestamp:Date.now(),runId:'run1',hypothesisId:'H-C'})}).catch(()=>{})
// #endregion

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)
