import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, X } from 'lucide-react'
import { Button } from './ui.jsx'
import './morph.css'

/* Soon's button-to-panel movement, with Radix handling focus and dismissal.
   The title and description stay part of the accessible dialog in every state. */
export function MorphAction({ label, title, description, children, variant = 'default', size = 'lg', disabled = false, closeLabel = 'Close referral signup' }) {
  const button = useRef(null), timer = useRef(null)
  const [open, setOpen] = useState(false), [ready, setReady] = useState(false), [rect, setRect] = useState(null)
  const [vp, setVp] = useState({ width: innerWidth, height: innerHeight })
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    const resize = () => setVp({ width: innerWidth, height: innerHeight })
    addEventListener('resize', resize)
    return () => { clearTimeout(timer.current); removeEventListener('resize', resize) }
  }, [])
  const close = () => { clearTimeout(timer.current); setReady(false); timer.current = setTimeout(() => setOpen(false), calm() ? 0 : 320) }
  const change = value => {
    if (!value) { close(); return }
    clearTimeout(timer.current); setRect(button.current.getBoundingClientRect().toJSON()); setOpen(true); setReady(false)
    timer.current = setTimeout(() => setReady(true), calm() ? 0 : 34)
  }
  const width = Math.min(480, vp.width - 24), height = Math.min(570, vp.height - 32)
  const to = { left: (vp.width - width) / 2, top: (vp.height - height) / 2, width, height, borderRadius: 16 }
  const from = rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: 8 } : to
  return <Dialog.Root open={open} onOpenChange={change}>
    <Dialog.Trigger asChild><Button ref={button} variant={variant} size={size} disabled={disabled}>{label}<ArrowRight /></Button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-[5px]" style={{ opacity: ready ? 1 : 0, transition: calm() ? 'none' : 'opacity 320ms' }} />
      <Dialog.Content className="bm-morph" data-ready={ready} style={ready ? to : from} onEscapeKeyDown={e => { e.preventDefault(); close() }} onPointerDownOutside={e => { e.preventDefault(); close() }}>
        <div className="bm-morph-inner" style={{ width }}>
          <div className="p-6 sm:p-8"><button onClick={close} aria-label={closeLabel} className="absolute right-3 top-3 grid size-10 place-items-center rounded-lg text-dim hover:bg-hover hover:text-fg"><X className="size-4" /></button>
            <Dialog.Title className="pr-6 text-xl font-semibold tracking-tight">{title}</Dialog.Title>
            <Dialog.Description className="mt-2 text-[13px] leading-relaxed text-mute">{description}</Dialog.Description>
            {children(close)}
          </div>
        </div>
        <span aria-hidden className="bm-morph-label">{label}<ArrowRight className="size-4" /></span>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
