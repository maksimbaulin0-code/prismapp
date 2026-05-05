import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TelegramInit>
      <App />
    </TelegramInit>
  </React.StrictMode>,
)

// Telegram initialization wrapper component
function TelegramInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Telegram Web App if available
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Ready signal
      tg.ready()
      
      // Expand to full height
      tg.expand()
      
      // Set header color to match our dark theme
      tg.setHeaderColor('#000000')
      tg.setBackgroundColor('#000000')
      
      console.log('Telegram Web App initialized:', {
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme,
        user: tg.initDataUnsafe?.user,
      })
    } else {
      console.log('Running outside Telegram - development mode')
    }
  }, [])

  return <>{children}</>
}
