import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './services/analytics'
import { applyCourseAccent } from './utils/applyCourseAccent'

// Module-level so StrictMode double-mount can't run it twice.
initAnalytics()
// Runs before the first paint so there's no flash of the wrong course's color.
applyCourseAccent()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
