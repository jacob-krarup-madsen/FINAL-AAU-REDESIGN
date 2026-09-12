import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import './global.css'
import { AppProvider } from '@/components/Providers/AppProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
