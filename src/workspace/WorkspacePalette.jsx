/* Ctrl/Cmd+K in the design workspace: jump to any section, any admin workflow, any area of the mock apps, or to a heading on the page you are reading. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppWindow, FileText, Globe, Hash, LayoutGrid, Shield, UserCog } from 'lucide-react'
import { CommandPalette, usePaletteHotkey } from '../components/Palette.jsx'
import { ADMIN_SECTIONS } from '../studio/AdminStudio.jsx'
import { SECTIONS } from './Bar.jsx'

export default function WorkspacePalette() {
  const [open, setOpen] = useState(false)
  const [here, setHere] = useState([])
  usePaletteHotkey(setOpen, { slash: true })
  /* the headings of the page that is open: read when the palette opens, so it always matches what is on screen */
  useEffect(() => {
    if (!open) return
    setHere([...document.querySelectorAll('section[id^="sec-"]')].map((s) => ({ id: 'here:' + s.id, label: s.querySelector('h2')?.textContent || s.id, hint: 'on this page', icon: Hash, run: () => s.scrollIntoView({ behavior: 'smooth', block: 'start' }) })))
  }, [open])
  const groups = useMemo(() => [
    ...(here.length ? [{ heading: 'On this page', items: here }] : []),
    { heading: 'Design system', items: SECTIONS.filter(([, , to]) => to.startsWith('/ds/')).map(([n, l, to]) => ({ id: 'ds' + to, label: l, hint: n, icon: LayoutGrid, to })) },
    { heading: 'Admin workflows', items: ADMIN_SECTIONS.flatMap(([g, items]) => items.map(([id, l]) => ({ id: 'ad' + id, label: l, hint: g, icon: UserCog, to: '/ds/adminstudio?s=' + id }))) },
    { heading: 'The mock apps', items: [
      { id: 'site-referral', label: 'Referral program', icon: Globe, to: '/site/referral', hint: '15–20% commission' },
      { id: 'site-invitation', label: 'Referral invitation', icon: Globe, to: '/site/invite?ref=trencito', hint: 'The invited visitor’s landing page' },
      { id: 'site-games', label: 'Game hosting', icon: Globe, to: '/site/games', hint: 'Minecraft, CS2, CS 1.6 and more' },
      { id: 'app', label: 'Customer app', icon: AppWindow, to: '/', hint: 'overview' }, { id: 'app-deploy', label: 'Deploy', icon: AppWindow, to: '/catalog' }, { id: 'app-vps', label: 'VPS', icon: AppWindow, to: '/vps' }, { id: 'app-mail', label: 'Email', icon: AppWindow, to: '/email' }, { id: 'app-billing', label: 'Billing', icon: AppWindow, to: '/billing' },
      { id: 'adm', label: 'Admin', icon: Shield, to: '/admin', hint: 'dashboard' }, { id: 'adm-c', label: 'Admin customers', icon: Shield, to: '/admin/customers' }, { id: 'adm-s', label: 'Admin support desk', icon: Shield, to: '/admin/support' },
      { id: 'site', label: 'Public site', icon: Globe, to: '/site', hint: 'home' }, { id: 'site-b', label: 'Blog', icon: FileText, to: '/site/blog' }, { id: 'site-s', label: 'Status page', icon: Globe, to: '/site/status' }, { id: 'site-c', label: 'Changelog', icon: Globe, to: '/site/changelog' },
    ] },
    { heading: 'Standalone', items: [{ id: 'f-deploying', label: 'Deploying page', icon: FileText, hint: 'deploying.html', run: () => window.open(import.meta.env.BASE_URL + 'deploying.html?state=deploying', '_blank', 'noopener') }] },
  ], [here])
  return <CommandPalette open={open} onOpenChange={setOpen} scope="ds" placeholder="Jump to a section, a screen or a heading…" groups={groups} />
}
