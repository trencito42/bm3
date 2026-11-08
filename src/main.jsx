import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <TooltipProvider delayDuration={200}>
      <App />
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#0d0d10', border: '1px solid rgb(255 255 255 / .12)', color: '#fafafa' } }} />
    </TooltipProvider>
  </HashRouter>
)
