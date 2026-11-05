import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LogProvider } from './lib/LogProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LogProvider>
        <App />
      </LogProvider>
    </BrowserRouter>
  </StrictMode>,
)
