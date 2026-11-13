import { createContext, useContext, useMemo, useState } from 'react'
import { readSupportProfile, saveSupportProfile } from '../site/communitySupport.js'

const seed = {
  balance: 42.5,
  supportEntries: [
    { id: 'support-demo-1', amountCents: 1500, name: 'Mara', message: 'For the next late-night adventure.', public: true, when: 'Earlier in this demo' },
    { id: 'support-demo-2', amountCents: 1000, name: 'Tudor', message: 'See you at spawn.', public: true, when: 'Earlier in this demo' },
    { id: 'support-demo-3', amountCents: 750, name: '', message: '', public: false, when: 'Earlier in this demo' },
  ],
  services: [
    { id: 'vps-01', name: 'blipmade-prod', type: 'VPS Pro', icon: 'server', ip: '45.83.12.9', region: 'Frankfurt', status: 'running', cpu: 34, ram: 61, disk: 48, price: 12, due: 'Dec 02' },
    { id: 'web-02', name: 'portfolio.site', type: 'Web Hosting Nano', icon: 'globe', ip: '45.83.14.21', region: 'Amsterdam', status: 'running', cpu: 8, ram: 22, disk: 15, price: 4, due: 'Dec 09' },
    { id: 'db-03', name: 'pg-cluster', type: 'Managed Database', icon: 'db', ip: '10.0.4.7', region: 'Frankfurt', status: 'running', cpu: 72, ram: 88, disk: 64, price: 29, due: 'Dec 14' },
    { id: 'game-04', name: 'mc-survival', type: 'Game Server', icon: 'game', ip: '45.83.20.3', region: 'Helsinki', status: 'stopped', cpu: 0, ram: 0, disk: 31, price: 9, due: 'Dec 21' },
    { id: 'vps-05', name: 'staging', type: 'VPS Nano', icon: 'server', ip: '45.83.12.44', region: 'Frankfurt', status: 'running', cpu: 19, ram: 37, disk: 22, price: 4, due: 'Dec 28' },
  ],
  invoices: [
    { id: 'INV-1048', date: 'Nov 02', due: 'Nov 16', amount: 38, status: 'unpaid', items: [['VPS Pro · blipmade-prod', 12], ['Managed Database · pg-cluster', 29], ['Credit applied', -3]] },
    { id: 'INV-1047', date: 'Oct 21', due: 'Nov 04', amount: 9, status: 'overdue', items: [['Game Server · mc-survival', 9]] },
    { id: 'INV-1046', date: 'Oct 02', due: 'Oct 16', amount: 41, status: 'paid', items: [['VPS Pro · blipmade-prod', 12], ['Managed Database · pg-cluster', 29]] },
    { id: 'INV-1045', date: 'Sep 14', due: 'Sep 28', amount: 8, status: 'paid', items: [['VPS Nano · staging', 4], ['Web Hosting Nano', 4]] },
    { id: 'INV-1044', date: 'Sep 02', due: 'Sep 16', amount: 41, status: 'paid', items: [['VPS Pro · blipmade-prod', 12], ['Managed Database · pg-cluster', 29]] },
    { id: 'INV-1043', date: 'Aug 18', due: 'Sep 01', amount: 12, status: 'paid', items: [['Domain · blipmade.app', 12]] },
  ],
  tickets: [
    { id: 1, subject: 'Cannot reach my VPS over SSH', status: 'open', when: '12 min ago', dept: 'Technical', msgs: [['me', 'Hi, since this morning I cannot SSH into blipmade-prod. Connection times out.', '09:12'], ['bot', 'Thanks for reaching out. I checked the node: the firewall rule for port 22 was reset during maintenance. I can restore it now.', '09:14']] },
    { id: 2, subject: 'Upgrade pg-cluster to 8 GB RAM', status: 'answered', when: '2 h ago', dept: 'Sales', msgs: [['me', 'Can I upgrade pg-cluster to the 8 GB plan without downtime?', '07:40'], ['bot', 'Yes. The upgrade is online, takes about 90 seconds, and is prorated on your next invoice.', '07:42']] },
    { id: 3, subject: 'Invoice INV-1047 question', status: 'closed', when: '3 days ago', dept: 'Billing', msgs: [['me', 'Why was I charged for a stopped server?', 'Mon'], ['bot', 'Stopped servers keep their disk and IP reserved, so they are billed at the storage rate.', 'Mon']] },
  ],
  domains: [
    { d: 'blipmade.app', exp: 'Aug 18, 2027', auto: true },
    { d: 'stefan.dev', exp: 'Mar 02, 2027', auto: true },
    { d: 'portfolio.site', exp: 'Jan 11, 2027', auto: false },
  ],
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [s, setS] = useState(() => ({ ...seed, supportProfile: readSupportProfile() }))
  const actions = useMemo(() => ({
    patchSupportProfile: (profile) => {
      saveSupportProfile(profile)
      setS(p => ({ ...p, supportProfile: profile }))
    },
    // Mock only: one state update credits the owner and records the contribution.
    // Production must use a verified payment webhook and an idempotent wallet ledger.
    addSupportContribution: entry => setS(p => {
      if (!p.supportProfile.accepting || !Number.isInteger(entry.amountCents) || entry.amountCents < 100 || entry.amountCents > 100000 || p.supportEntries.some(e => e.id === entry.id)) return p
      return { ...p, balance: (Math.round(p.balance * 100) + entry.amountCents) / 100, supportEntries: [{ ...entry, source: 'community-support', referralEligible: false }, ...p.supportEntries] }
    }),
    payInvoice: (id) => setS((p) => ({ ...p, invoices: p.invoices.map((i) => (i.id === id ? { ...i, status: 'paid' } : i)) })),
    addFunds: (n) => setS((p) => ({ ...p, balance: p.balance + n })),
    addService: (svc) => setS((p) => ({ ...p, services: [svc, ...p.services] })),
    patchService: (id, patch) => setS((p) => ({ ...p, services: p.services.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    addTicket: (t) => setS((p) => ({ ...p, tickets: [t, ...p.tickets] })),
    patchTicket: (id, fn) => setS((p) => ({ ...p, tickets: p.tickets.map((t) => (t.id === id ? fn(t) : t)) })),
    toggleDomain: (d) => setS((p) => ({ ...p, domains: p.domains.map((x) => (x.d === d ? { ...x, auto: !x.auto } : x)) })),
  }), [])
  return <Ctx.Provider value={{ ...s, ...actions }}>{children}</Ctx.Provider>
}

export const PLANS = [
  { id: 'nano', name: 'Nano', price: 4, specs: ['1 vCPU', '1 GB RAM', '25 GB NVMe', '1 TB traffic'] },
  { id: 'pro', name: 'Pro', price: 12, specs: ['2 vCPU', '4 GB RAM', '80 GB NVMe', '4 TB traffic'], tag: 'Popular' },
  { id: 'max', name: 'Max', price: 29, specs: ['6 vCPU', '16 GB RAM', '240 GB NVMe', '10 TB traffic'] },
]
