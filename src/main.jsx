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
      <Toaster theme="dark" position="bottom-right" duration={2800} visibleToasts={3} offset={20} mobileOffset={{ bottom: 84, left: 16, right: 16 }} toastOptions={{ style: { background: '#0d0d10', border: '1px solid rgb(255 255 255 / .12)', color: '#fafafa' } }} />
    </TooltipProvider>
  </HashRouter>
)
