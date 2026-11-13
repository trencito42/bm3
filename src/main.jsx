import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import App from './App.jsx'
import './index.css'
import { readReferral, referralPath } from './site/referrals.js'
import { validSupportSlug } from './site/communitySupport.js'

// A shared public URL has a normal query string, while this workspace uses hash
// routes. Resolve it before mounting the router so it never opens the dashboard.
const invitation = readReferral(window.location.search)
if (new URLSearchParams(window.location.search).has('ref') && !window.location.hash) {
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${referralPath('/site/invite', invitation)}`)
}
const community = window.location.pathname.match(/^\/support\/([^/]+)\/?$/)?.[1]
if (validSupportSlug(community) && !window.location.hash) {
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/site/support/${community}`)
}

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <TooltipProvider delayDuration={200}>
      <App />
      <Toaster theme="dark" position="bottom-right" duration={2800} visibleToasts={3} offset={20} mobileOffset={{ bottom: 84, left: 16, right: 16 }} toastOptions={{ style: { background: '#0d0d10', border: '1px solid rgb(255 255 255 / .12)', color: '#fafafa' } }} />
    </TooltipProvider>
  </HashRouter>
)
