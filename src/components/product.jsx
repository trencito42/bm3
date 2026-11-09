/* Blipmade Product Components — hosting-native pieces built on the shared primitives. All data is MOCK. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Inbox, ArrowLeft, MailOpen } from 'lucide-react'
import {
  Archive, ArrowUp, Check, ChevronRight, Download, File as FileIcon, Folder, Globe, KeyRound, Lock, Mail, MoreHorizontal, Paperclip, Pencil, Play, Plus, Power, RefreshCw, Search, Send, Server, Shield, ShieldCheck, Square, Terminal, Trash2, Upload, X, Star, Reply, CircleAlert, Loader2, CheckCircle2, Circle, Cpu, HardDrive,
} from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Progress, Switch, Textarea, StatusBadge, IconTile, RadioGroup, RadioCard, Segmented, Separator, Tooltip } from './ui.jsx'
import { Combobox, ContextContent, ContextItem, ContextMenu, ContextSep, ContextTrigger, CopyValue, Confirm, FormField, Select, Skeleton, inputCls, InlineAlert, Checkbox } from './ui2.jsx'
import { AnimatedPrice, DotBars, DotGauge, DotNum } from './DotViz.jsx'
import { Orb } from '../builder/FxBits.jsx'
import { cn, money, sleep } from '../lib/utils'
import { DNS, EXTRA_MESSAGES, FILES, FIREWALL, LOGS, MAILBOXES, MESSAGES, SNAPSHOTS, SSH_KEYS } from '../lib/mock'

/* ============================ Server & app management ============================ */
export function ServerCard({ app, onOpen }) {
  const on = app.status === 'running'
  return (
    <button onClick={onOpen} className="group flex w-full flex-col gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-line-2">
      <div className="flex items-center gap-3">
        <IconTile><Server /></IconTile>
        <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{app.name}</div><div className="text-[12.5px] text-mute">{app.kind} {app.ver} · {app.region}</div></div>
        <StatusBadge status={app.status} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-[12px] text-dim">
        {[['CPU', app.cpu], ['RAM', app.ram], ['DISK', app.disk]].map(([l, v]) => <div key={l} className="space-y-1.5"><div className="flex justify-between"><span>{l}</span><span className="tabular-nums text-mute">{on || l === 'DISK' ? v : 0}%</span></div><Progress value={on || l === 'DISK' ? v : 0} hot={v > 85} /></div>)}
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-dim"><span>:{app.port}</span><span>{app.git}</span></div>
    </button>
  )
}

export const ResourceUsage = ({ cpu, ram, disk, size = 104 }) => (
  <div className="flex flex-wrap items-center justify-around gap-4 py-2"><DotGauge value={cpu} label="CPU" size={size} /><DotGauge value={ram} label="RAM" size={size} /><DotGauge value={disk} label="DISK" size={size} /></div>
)
export const NetworkTraffic = ({ values }) => (
  <div><div className="mb-3 flex items-end justify-between"><div><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Outbound · 24 h</div><div className="mt-1.5"><DotNum text="148 MB/S" height={20} animate={false} /></div></div><div className="text-right text-xs text-dim">Peak 312 · Avg 96</div></div><DotBars values={values} rows={8} unit="Mbps" /></div>
)
export function PowerControls({ status, onAction, size = 'md' }) {
  const busy = status === 'restarting'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size={size} disabled={status === 'running' || busy} onClick={() => onAction('start')}><Play />Start</Button>
      <Button size={size} variant="outline" disabled={status !== 'running' || busy} onClick={() => onAction('restart')}><RefreshCw className={cn(busy && 'animate-spin')} />Restart</Button>
      <Confirm danger title="Stop this server?" description="Running processes are terminated gracefully. Disk and IP stay reserved and billing continues." confirmLabel="Stop server" onConfirm={() => onAction('stop')} trigger={<Button size={size} variant="destructive" disabled={status !== 'running' || busy}><Square />Stop</Button>} />
    </div>
  )
}
export function KeyValueEditor({ title, rows: init, secret }) {
  const [rows, setRows] = useState(init)
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
          <input defaultValue={r[0]} aria-label="Key" className={cn(inputCls(), 'font-mono text-[12.5px]')} />
          <input defaultValue={r[1]} type={secret ? 'password' : 'text'} aria-label="Value" className={cn(inputCls(), 'font-mono text-[12.5px]')} />
          <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, k) => k !== i))}><Trash2 /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setRows([...rows, ['', '']])}><Plus />Add variable</Button>
    </div>
  )
}
export const DatabaseCredentials = () => (
  <div className="space-y-2.5">
    <CopyValue label="Host" value="pg-main.fra.blipmade.internal" /><CopyValue label="Port" value="5432" /><CopyValue label="User" value="app_prod" /><CopyValue label="Pass" value="s3cr3t-demo-password" mask />
    <CopyValue label="URL" value="postgres://app_prod:••••@pg-main.fra.blipmade.internal:5432/app" />
  </div>
)

/* ============================ Console ============================ */
export function TerminalPanel({ status = 'running', height = 260, dense }) {
  const [lines, setLines] = useState(LOGS)
  const [q, setQ] = useState('')
  const [cmd, setCmd] = useState('')
  const [paused, setPaused] = useState(false)
  const box = useRef(null)
  useEffect(() => { box.current?.scrollTo({ top: 1e6 }) }, [lines])
  const run = () => {
    const v = cmd.trim(); if (!v) return
    setCmd('')
    const t = new Date().toTimeString().slice(0, 8)
    const out = { help: 'commands: help, status, restart, clear', status: 'running · 31% cpu · 54% ram', clear: null }[v]
    if (v === 'clear') return setLines([])
    setLines((l) => [...l, [t, 'cmd', '$ ' + v], [t, out ? 'info' : 'warn', out || `unknown command: ${v}`]])
  }
  const shown = lines.filter((l) => !q || l[2].toLowerCase().includes(q.toLowerCase()))
  const offline = status !== 'running'
  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-black">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <span className={cn('flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.06em]', offline ? 'text-dim' : 'text-ok')}><i className={cn('size-1.5 rounded-full', offline ? 'bg-dim' : 'bg-ok shadow-[0_0_8px_var(--color-ok)]')} />{offline ? 'Offline' : 'Connected'}</span>
        <div className="relative ml-auto w-44 min-w-0 max-w-full"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter output" aria-label="Filter output" className="h-7 w-full rounded-md border border-line bg-transparent pl-8 pr-2 text-[12px] outline-none placeholder:text-dim focus:border-line-2" /></div>
        <Button variant="ghost" size="sm" className="h-7" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</Button>
        <Button variant="ghost" size="sm" className="h-7" onClick={() => setLines([])}>Clear</Button>
      </div>
      <div ref={box} style={{ height }} className="overflow-y-auto p-3 font-mono text-[12.5px] leading-6">
        {offline && <div className="grid h-full place-items-center text-center text-dim"><div><Terminal className="mx-auto mb-2 size-5" />Server is offline. Start it to stream the console.</div></div>}
        {!offline && shown.length === 0 && <div className="grid h-full place-items-center text-dim">No output{q && ' matches the filter'}.</div>}
        {!offline && shown.map((l, i) => (
          <div key={i} className="flex gap-3"><span className="shrink-0 text-dim">{l[0]}</span><span className={cn('w-10 shrink-0 uppercase', l[1] === 'error' ? 'text-bad' : l[1] === 'warn' ? 'text-warn' : l[1] === 'cmd' ? 'text-info' : 'text-dim')}>{l[1]}</span><span className={cn('min-w-0 break-words', l[1] === 'error' ? 'text-bad' : l[1] === 'cmd' ? 'text-fg' : 'text-fg/80')}>{l[2]}</span></div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-line px-3">
        <span className="font-mono text-[12.5px] text-dim">$</span>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} disabled={offline} placeholder={offline ? 'offline' : 'type a command (try: help)'} aria-label="Command" className="h-10 flex-1 bg-transparent font-mono text-[12.5px] outline-none placeholder:text-dim disabled:opacity-40" />
        <span className="font-mono text-[10.5px] text-dim">SIMULATED</span>
      </div>
    </div>
  )
}

/* ============================ File manager ============================ */
const fmtSize = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB')
/* File manager (simulated): inline rename (F2 / menu), delete with undo, upload by button or drag-and-drop with
   progress, new folder that opens straight into rename, keyboard selection. Nothing leaves the browser. */
export function FileExplorer({ compact }) {
  const [files, setFiles] = useState(() => FILES.map((f, i) => ({ ...f, id: 'f' + i })))
  const [sel, setSel] = useState(['f5'])
  const [q, setQ] = useState('')
  const [renaming, setRenaming] = useState(null)
  const [prog, setProg] = useState({})
  const [drag, setDrag] = useState(false)
  const input = useRef(null)
  const depth = useRef(0)
  const uid = useRef(0)
  const listRef = useRef(null)
  const wasRenaming = useRef(false)
  /* leaving the rename input unmounts it and drops focus to <body>: hand it back to the list so F2 / arrows / Delete keep working */
  useEffect(() => {
    if (wasRenaming.current && !renaming && (!document.activeElement || document.activeElement === document.body)) listRef.current?.focus({ preventScroll: true })
    wasRenaming.current = !!renaming
  }, [renaming])
  const timers = useRef({})
  const stopUpload = (id) => { clearInterval(timers.current[id]); delete timers.current[id] }
  useEffect(() => () => { Object.values(timers.current).forEach(clearInterval); timers.current = {} }, [])
  const rows = files.filter((f) => f.n.toLowerCase().includes(q.toLowerCase()))
  const one = sel.length === 1 ? files.find((f) => f.id === sel[0]) : null
  const nameTaken = (n, id) => files.some((f) => f.n === n && f.id !== id)

  const commitRename = (id, raw) => {
    const n = raw.trim()
    const cur = files.find((f) => f.id === id)
    if (!n || n === cur.n) { setRenaming(null); return true }
    if (/[\\/]/.test(n)) { toast.error('Names cannot contain / or \\'); return false }
    if (nameTaken(n, id)) { toast.error(`“${n}” already exists here`); return false }
    setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, n, m: 'Just now' } : f)))
    setRenaming(null)
    toast(`Renamed to ${n}`)
    return true
  }
  const remove = (ids) => {
    if (!ids.length) return
    const removed = files.map((f, i) => ({ f, i })).filter(({ f }) => ids.includes(f.id))
    ids.forEach(stopUpload)
    setProg((p) => { const n = { ...p }; ids.forEach((id) => delete n[id]); return n })
    setFiles((fs) => fs.filter((f) => !ids.includes(f.id)))
    setSel([])
    toast(`Deleted ${removed.length === 1 ? removed[0].f.n : removed.length + ' items'}`, {
      action: { label: 'Undo', onClick: () => setFiles((fs) => { const out = [...fs]; removed.forEach(({ f, i }) => out.splice(Math.min(i, out.length), 0, f)); return out }) },
    })
  }
  const newFolder = () => {
    let n = 'new-folder', k = 1
    while (nameTaken(n)) n = `new-folder-${++k}`
    const id = 'n' + (++uid.current)
    setFiles((fs) => [{ id, n, t: 'dir', s: '—', m: 'Just now', p: 'drwxr-xr-x' }, ...fs])
    setSel([id]); setRenaming(id)
  }
  const upload = (list) => {
    const arr = [...list]
    if (!arr.length) return
    const taken = new Set(files.map((f) => f.n))
    const added = arr.map((file) => {
      let n = file.name, k = 0
      while (taken.has(n)) n = file.name.replace(/(\.[^.]*)?$/, ` (${++k})$1`)
      taken.add(n)
      return { id: 'u' + (++uid.current), n, t: 'file', s: fmtSize(file.size), m: 'Just now', p: '-rw-r--r--', size: file.size }
    })
    setFiles((fs) => [...added, ...fs])
    setSel(added.map((x) => x.id))
    setProg((p) => ({ ...p, ...Object.fromEntries(added.map((x) => [x.id, 0])) }))
    let left = added.length
    const finish = (x) => {
      stopUpload(x.id)
      if (--left === 0) toast.success(added.length === 1 ? `Uploaded ${added[0].n}` : `Uploaded ${added.length} files`)
    }
    added.forEach((x) => {
      let v = 0
      const t = setInterval(() => {
        v = Math.min(100, v + 6 + Math.random() * 14)
        setProg((p) => (x.id in p ? { ...p, [x.id]: v } : p))
        if (v >= 100) {
          finish(x)
          timers.current[x.id] = setTimeout(() => { delete timers.current[x.id]; setProg((p) => { const { [x.id]: _, ...rest } = p; return rest }) }, 350)
        }
      }, 110)
      timers.current[x.id] = t
    })
  }
  const dragProps = {
    onDragEnter: (e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); depth.current++; setDrag(true) } },
    onDragOver: (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() },
    onDragLeave: () => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDrag(false) },
    onDrop: (e) => { e.preventDefault(); depth.current = 0; setDrag(false); upload(e.dataTransfer.files) },
  }
  const onKey = (e) => {
    if (renaming) return
    const box = e.currentTarget
    const i = rows.findIndex((f) => f.id === sel[sel.length - 1])
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = rows[Math.min(rows.length - 1, Math.max(0, i < 0 ? 0 : i + (e.key === 'ArrowDown' ? 1 : -1)))]
      if (!n) return
      setSel(e.shiftKey ? [...new Set([...sel, n.id])] : [n.id])
      requestAnimationFrame(() => box.querySelector(`[data-id="${n.id}"]`)?.scrollIntoView({ block: 'nearest' }))
    } else if (e.key === ' ' && i >= 0) { e.preventDefault(); setSel((s) => (s.includes(rows[i].id) ? s.filter((x) => x !== rows[i].id) : [...s, rows[i].id])) }
    else if (e.key === 'F2' && one && !(one.id in prog)) { e.preventDefault(); setRenaming(one.id) }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) { e.preventDefault(); remove(sel.filter((id) => !(id in prog))) }
    else if (e.key === 'Escape') setSel([])
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); setSel(rows.map((f) => f.id)) }
  }

  return (
    <div className="relative grid overflow-hidden rounded-xl border border-line-2 bg-card md:grid-cols-[1fr_auto]" {...dragProps}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <nav className="flex items-center gap-1 font-mono text-[12px] text-dim"><span className="hover:text-fg">/home</span><ChevronRight className="size-3" /><span className="hover:text-fg">container</span><ChevronRight className="size-3" /><span className="text-fg">api-gateway</span></nav>
          <div className="ml-auto flex items-center gap-1">
            {!compact && <div className="relative mr-1 w-40"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" aria-label="Search files" className="h-7 w-full rounded-md border border-line bg-transparent pl-8 pr-2 text-[12px] outline-none transition-colors placeholder:text-dim hover:border-line-2 focus:border-line-2" /></div>}
            <input ref={input} type="file" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
            <Button variant="outline" size="sm" className="h-7" onClick={() => input.current?.click()}><Upload />Upload</Button>
            <Button variant="outline" size="sm" className="h-7" onClick={newFolder}><Plus />New</Button>
          </div>
        </div>
        {sel.length > 1 && <div className="flex items-center gap-2 border-b border-line bg-white/[0.04] px-3 py-1.5 text-[12.5px]"><span>{sel.length} selected</span><Button size="sm" variant="ghost" className="h-6" onClick={() => toast('Archive simulated')}><Archive />Compress</Button><Button size="sm" variant="ghost" className="h-6 text-bad" onClick={() => remove(sel.filter((id) => !(id in prog)))}><Trash2 />Delete</Button><button className="ml-auto text-dim hover:text-fg" onClick={() => setSel([])}>Clear</button></div>}
        <div className="max-h-[340px] min-h-[120px] overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20" ref={listRef} role="listbox" aria-multiselectable="true" aria-label="Files" tabIndex={0} onKeyDown={onKey}>
          {rows.map((f) => {
            const busy = f.id in prog
            return (
              <ContextMenu key={f.id}>
                <ContextTrigger asChild>
                  <div data-id={f.id} data-name={f.n} role="option" aria-selected={sel.includes(f.id)} onClick={(e) => setSel((s) => (e.metaKey || e.ctrlKey ? (s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id]) : [f.id]))} onDoubleClick={() => !busy && setRenaming(f.id)} className={cn('flex cursor-pointer items-center gap-3 border-b border-line/50 px-3 py-2 text-[13px] transition-colors duration-100 last:border-b-0 hover:bg-hover', sel.includes(f.id) && 'bg-white/[0.06] shadow-[inset_2px_0_0_var(--color-fg)]')}>
                    <Checkbox checked={sel.includes(f.id)} onCheckedChange={(v) => setSel((s) => (v ? [...s, f.id] : s.filter((x) => x !== f.id)))} onClick={(e) => e.stopPropagation()} aria-label={`Select ${f.n}`} />
                    {f.t === 'dir' ? <Folder className="size-4 shrink-0 text-info" /> : <FileIcon className="size-4 shrink-0 text-dim" />}
                    <div className="min-w-0 flex-1">
                      {renaming === f.id ? (
                        <input autoFocus defaultValue={f.n} aria-label="New name" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}
                          onFocus={(e) => { const dot = f.t === 'dir' ? -1 : f.n.lastIndexOf('.'); e.target.setSelectionRange(0, dot > 0 ? dot : f.n.length) }}
                          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); commitRename(f.id, e.currentTarget.value) } else if (e.key === 'Escape') setRenaming(null) }}
                          onBlur={(e) => { if (renaming === f.id && !commitRename(f.id, e.currentTarget.value)) { e.currentTarget.focus() } }}
                          className="h-6 w-full rounded border border-white/40 bg-black px-1.5 text-[13px] outline-none ring-2 ring-white/10" />
                      ) : <span className="block truncate">{f.n}</span>}
                      {busy && <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full bg-white/10"><i className="block h-full rounded-full bg-fg transition-[width] duration-100" style={{ width: prog[f.id] + '%' }} /></span>}
                    </div>
                    {!compact && <span className="hidden font-mono text-[11px] text-dim lg:block">{f.p}</span>}
                    <span className="w-16 text-right font-mono text-[11.5px] text-dim">{busy ? Math.round(prog[f.id]) + '%' : f.s}</span>
                    {!compact && <span className="hidden w-28 text-right text-[12px] text-dim md:block">{f.m}</span>}
                  </div>
                </ContextTrigger>
                <ContextContent>
                  <ContextItem disabled={busy} onSelect={() => setRenaming(f.id)}><Pencil />Rename<span className="ml-auto font-mono text-[10.5px] text-dim">F2</span></ContextItem>
                  <ContextItem onSelect={() => toast('Download simulated')}><Download />Download</ContextItem>
                  <ContextItem onSelect={() => toast('Compress simulated')}><Archive />Compress</ContextItem>
                  <ContextItem onSelect={() => toast('Permissions are in the inspector')}><Lock />Permissions</ContextItem>
                  <ContextSep />
                  <ContextItem danger disabled={busy} onSelect={() => remove(sel.includes(f.id) ? sel : [f.id])}><Trash2 />Delete<span className="ml-auto font-mono text-[10.5px] text-dim">Del</span></ContextItem>
                </ContextContent>
              </ContextMenu>
            )
          })}
          {rows.length === 0 && (
            <div className="grid place-items-center gap-2 px-6 py-10 text-center text-[13px] text-dim">
              <Upload className="size-5" />
              {q ? <>No files match “{q}”</> : <>This folder is empty. Drop files here, or <button className="text-fg underline underline-offset-4" onClick={() => input.current?.click()}>choose files</button>.</>}
            </div>
          )}
        </div>
      </div>
      {!compact && (
        <aside className="hidden w-64 border-l border-line p-4 md:block">
          {one ? (<><div className="mb-3 flex items-center gap-2 font-medium">{one.t === 'dir' ? <Folder className="size-4 text-info" /> : <FileIcon className="size-4 text-dim" />}<span className="truncate">{one.n}</span></div>
            <dl className="space-y-2 text-[12.5px]">{[['Size', one.s], ['Modified', one.m], ['Mode', one.p]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-dim">{k}</dt><dd className="font-mono">{v}</dd></div>)}</dl>
            {one.n.endsWith('.js') && <pre className="mt-4 overflow-hidden rounded-lg border border-line bg-black p-3 font-mono text-[11px] leading-5 text-fg/70">{`import http from 'http'\nconst port = 3000\nhttp.createServer((q, r) => {\n  r.end('ok')\n}).listen(port)`}</pre>}
            <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => setRenaming(one.id)}><Pencil />Rename</Button><Button size="sm" variant="outline" className="flex-1" onClick={() => toast('Download simulated')}><Download />Get</Button></div></>)
            : <div className="grid h-full min-h-40 place-items-center text-center text-[12.5px] text-dim">{sel.length > 1 ? `${sel.length} items selected` : 'Select a single file to preview.'}</div>}
        </aside>
      )}
      <div aria-hidden className={cn('pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-xl border-2 border-dashed border-white/50 bg-black/70 text-[13px] font-medium backdrop-blur-[2px] transition-opacity duration-150', drag ? 'opacity-100' : 'opacity-0')}><span className="flex items-center gap-2"><Upload className="size-4" />Drop to upload</span></div>
    </div>
  )
}
export const UploadManager = () => {
  const [p, setP] = useState([64, 22, 100])
  useEffect(() => { const t = setInterval(() => setP((a) => a.map((v) => (v >= 100 ? v : Math.min(100, v + 6)))), 700); return () => clearInterval(t) }, [])
  return (
    <div className="space-y-3">
      {[['assets-pack.zip', '84 MB'], ['dump.sql', '212 MB'], ['logo.svg', '4 KB']].map(([n, s], i) => (
        <div key={n} className="space-y-1.5"><div className="flex items-center justify-between text-[12.5px]"><span className="flex items-center gap-2"><FileIcon className="size-3.5 text-dim" />{n}<span className="text-dim">{s}</span></span><span className="font-mono text-[11px] text-dim">{p[i] >= 100 ? 'Done' : p[i] + '%'}</span></div><Progress value={p[i]} /></div>
      ))}
    </div>
  )
}

/* ============================ VPS ============================ */
export const SnapshotList = () => (
  <div className="divide-y divide-line/60 rounded-xl border border-line bg-card">
    {SNAPSHOTS.map((s) => (
      <div key={s.id} className="flex items-center gap-3 px-4 py-3">
        <IconTile><Archive /></IconTile>
        <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-medium">{s.name}</div><div className="text-xs text-dim">{s.when} · {s.size}</div></div>
        <Badge dot={false}>{s.kind}</Badge>
        <Confirm title={`Restore ${s.name}?`} description="The server is stopped, its disk is replaced with this snapshot, then started again. Changes since the snapshot are lost." confirmLabel="Restore" danger onConfirm={() => toast.success('Restore simulated')} requireText="restore" trigger={<Button variant="outline" size="sm">Restore</Button>} />
      </div>
    ))}
  </div>
)
export const SSHKeyList = () => (
  <div className="divide-y divide-line/60 rounded-xl border border-line bg-card">
    {SSH_KEYS.map((k) => (
      <div key={k.id} className="flex items-center gap-3 px-4 py-3"><IconTile><KeyRound /></IconTile><div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{k.name}</div><div className="font-mono text-[11.5px] text-dim">{k.fp}</div></div><div className="hidden text-right text-xs text-dim sm:block">Added {k.added}<br />Used {k.used}</div><Button variant="ghost" size="icon" aria-label="Remove key"><Trash2 /></Button></div>
    ))}
  </div>
)
export const FirewallRules = () => {
  const [rules, setRules] = useState(FIREWALL)
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card"><div className="min-w-[560px]">
      <div className="grid grid-cols-[60px_70px_100px_1fr_70px_40px] gap-3 border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><span>Dir</span><span>Proto</span><span>Port</span><span>Source</span><span>Action</span><span /></div>
      {rules.map((r) => (
        <div key={r.id} className="grid grid-cols-[60px_70px_100px_1fr_70px_40px] items-center gap-3 border-b border-line/50 px-4 py-2.5 text-[12.5px] last:border-b-0"><span className="font-mono uppercase text-dim">{r.dir}</span><span className="font-mono">{r.proto}</span><span className="font-mono">{r.port}</span><span className="truncate"><span className="font-mono">{r.src}</span><span className="ml-2 text-dim">{r.note}</span></span><Badge tone={r.act === 'allow' ? 'ok' : 'bad'} dot={false}>{r.act}</Badge><button aria-label="Delete rule" onClick={() => setRules(rules.filter((x) => x.id !== r.id))} className="text-dim hover:text-bad"><Trash2 className="size-3.5" /></button></div>
      ))}
    </div></div>
  )
}
export const IPAddressDisplay = () => (<div className="grid gap-2.5 sm:grid-cols-2"><CopyValue label="IPv4" value="45.83.12.9" /><CopyValue label="IPv6" value="2a01:4f8:c17:2b::1" /><CopyValue label="Gateway" value="45.83.12.1" /><CopyValue label="rDNS" value="prod.blipmade.app" /></div>)

/* ============================ Commerce ============================ */
export const PLAN_DATA = [
  { id: 'nano', name: 'Nano', price: 4, specs: ['1 vCPU', '1 GB RAM', '25 GB NVMe', '1 TB traffic'] },
  { id: 'pro', name: 'Pro', price: 12, specs: ['2 vCPU', '4 GB RAM', '80 GB NVMe', '4 TB traffic'], tag: 'Popular' },
  { id: 'max', name: 'Max', price: 29, specs: ['6 vCPU', '16 GB RAM', '240 GB NVMe', '10 TB traffic'] },
]
export function PlanSelector({ value, onChange, yearly }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-3 sm:grid-cols-3">
      {PLAN_DATA.map((p) => (
        <RadioCard key={p.id} value={p.id} className="p-4">
          <div className="flex items-center gap-2 text-[13px] text-dim">{p.name}{p.tag && <Badge tone="info" dot={false}>{p.tag}</Badge>}</div>
          <div className="mt-3 flex items-end gap-2"><DotNum text={money(p.price * (yearly ? 0.8 : 1)).replace('.00', '')} height={30} animate={false} /><span className="pb-0.5 text-[11.5px] text-dim">/ mo</span></div>
          <ul className="mt-4 space-y-1.5 text-[12.5px] text-mute">{p.specs.map((s) => <li key={s} className="flex items-center gap-2"><span className="size-1 rounded-full bg-dim" />{s}</li>)}</ul>
        </RadioCard>
      ))}
    </RadioGroup>
  )
}
export const BillingPeriod = ({ value, onChange }) => <Segmented value={value} onValueChange={(v) => v && onChange(v)} options={[['m', 'Monthly'], ['q', 'Quarterly −8%'], ['y', 'Yearly −20%']]} />
export const PriceBreakdown = ({ lines, total, period = 'month' }) => (
  <div className="space-y-2.5 text-[13.5px]">
    {lines.map(([l, p]) => <div key={l} className="flex justify-between text-mute"><span>{l}</span><span className="tabular-nums">{p < 0 ? '−' : ''}{money(Math.abs(p))}</span></div>)}
    <Separator />
    <div className="flex items-end justify-between"><span className="text-dim">Total / {period}</span><AnimatedPrice value={total} height={24} /></div>
  </div>
)
export function ProvisioningTimeline({ step = 2, failed }) {
  const S = ['Order accepted', 'Payment confirmed', 'Reserving capacity', 'Installing image', 'Configuring network', 'Ready']
  return (
    <ol className="space-y-3">
      {S.map((s, i) => {
        const done = i < step, cur = i === step, bad = failed && cur
        return (
          <li key={s} className="flex items-center gap-3 text-[13.5px]">
            {bad ? <CircleAlert className="size-4 text-bad" /> : done ? <CheckCircle2 className="size-4 text-ok" /> : cur ? <Loader2 className="size-4 animate-spin" /> : <Circle className="size-4 text-dim" />}
            <span className={cn(done || cur ? 'text-fg' : 'text-dim', bad && 'text-bad')}>{s}</span>{cur && !bad && <span className="font-mono text-[10.5px] text-dim">~12s</span>}{bad && <span className="font-mono text-[10.5px] text-bad">Out of capacity</span>}
          </li>
        )
      })}
    </ol>
  )
}
export const RegionSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {[['Frankfurt', '12 ms', ''], ['Amsterdam', '18 ms', ''], ['Helsinki', '31 ms', ''], ['Ashburn', '—', 'Offline']].map(([r, ms, off]) => (
      <button key={r} disabled={!!off} onClick={() => onChange(r)} className={cn('rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40', value === r ? 'border-fg bg-white/[0.05]' : 'border-line-2 hover:border-white/30')}><div className="text-[13px] font-medium">{r}</div><div className="font-mono text-[11px] text-dim">{off || ms}</div></button>
    ))}
  </div>
)
export const OSSelector = ({ value, onChange }) => <div className="flex flex-wrap gap-2">{['Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9', 'Arch', 'FreeBSD 14'].map((o) => <button key={o} onClick={() => onChange(o)} className={cn('h-8 rounded-lg border px-3 text-[13px] transition-colors', value === o ? 'border-fg bg-fg text-black' : 'border-line-2 text-mute hover:text-fg')}>{o}</button>)}</div>

/* ============================ Domains & email ============================ */
export const SSLStatus = ({ state = 'valid' }) => {
  const m = { valid: ['ok', 'Valid', 'Let’s Encrypt · expires in 61 days'], expiring: ['warn', 'Expiring', 'Renews automatically in 6 days'], pending: ['info', 'Issuing', 'DNS challenge in progress'], error: ['bad', 'Failed', 'CAA record blocks issuance'] }[state]
  return <div className="flex items-center gap-3 rounded-lg border border-line p-3"><IconTile><ShieldCheck /></IconTile><div className="flex-1"><div className="text-[13.5px] font-medium">SSL certificate</div><div className="text-xs text-dim">{m[2]}</div></div><Badge tone={m[0]}>{m[1]}</Badge></div>
}
export function DNSRecordTable() {
  const [rows, setRows] = useState(DNS)
  const [adding, setAdding] = useState(false)
  const [rec, setRec] = useState({ type: 'A', name: '', value: '', ttl: '3600' })
  const bad = adding && rec.type === 'A' && rec.value && !/^(\d{1,3}\.){3}\d{1,3}$/.test(rec.value)
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-line bg-card"><div className="min-w-[600px]">
        <div className="grid grid-cols-[70px_100px_1fr_70px_60px_32px] gap-3 border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><span>Type</span><span>Name</span><span>Value</span><span>TTL</span><span>Check</span><span /></div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[70px_100px_1fr_70px_60px_32px] items-center gap-3 border-b border-line/50 px-4 py-2.5 text-[12.5px] last:border-b-0"><Badge dot={false}>{r.type}</Badge><span className="font-mono">{r.name}</span><span className="truncate font-mono text-mute">{r.value}</span><span className="font-mono text-dim">{r.ttl}</span>{r.ok ? <CheckCircle2 className="size-4 text-ok" /> : <CircleAlert className="size-4 text-warn" />}<button aria-label="Delete" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="text-dim hover:text-bad"><Trash2 className="size-3.5" /></button></div>
        ))}
      </div></div>
      {adding ? (
        <div className="grid items-start gap-2 rounded-xl border border-line-2 p-3 sm:grid-cols-[100px_120px_1fr_90px_auto]">
          <Select value={rec.type} onValueChange={(v) => setRec({ ...rec, type: v })} options={['A', 'AAAA', 'CNAME', 'MX', 'TXT']} />
          <input placeholder="name" value={rec.name} onChange={(e) => setRec({ ...rec, name: e.target.value })} className={cn(inputCls(), 'font-mono')} aria-label="Name" />
          <div><input placeholder="value" value={rec.value} onChange={(e) => setRec({ ...rec, value: e.target.value })} className={cn(inputCls(bad), 'font-mono')} aria-label="Value" />{bad && <p className="mt-1 text-[12px] text-bad">Enter a valid IPv4 address</p>}</div>
          <Select value={rec.ttl} onValueChange={(v) => setRec({ ...rec, ttl: v })} options={['300', '3600', '86400']} />
          <div className="flex gap-1"><Button disabled={!rec.value || bad} onClick={() => { setRows([...rows, { id: 'n' + rows.length, ...rec, name: rec.name || '@', ok: false }]); setAdding(false); setRec({ type: 'A', name: '', value: '', ttl: '3600' }); toast.success('Record added (simulated)') }}>Add</Button><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </div>
      ) : <Button variant="outline" size="sm" onClick={() => setAdding(true)}><Plus />Add record</Button>}
    </div>
  )
}
export const MailboxTable = () => (
  <div className="divide-y divide-line/60 rounded-xl border border-line bg-card">
    {MAILBOXES.map((m) => (
      <div key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3"><IconTile><Mail /></IconTile><div className="min-w-40 flex-1"><div className="text-[13.5px] font-medium">{m.addr}</div><div className="text-xs text-dim">{m.aliases} aliases</div></div><div className="w-40"><div className="mb-1 flex justify-between text-[11.5px] text-dim"><span>{m.used} GB</span><span>{m.quota} GB</span></div><Progress value={(m.used / m.quota) * 100} hot={m.used / m.quota > 0.85} /></div><Badge tone={m.status === 'active' ? 'ok' : 'warn'}>{m.status}</Badge></div>
    ))}
  </div>
)
/* Webmail (simulated): folders, search, toolbar actions with undo, keyboard shortcuts (e archive, # delete,
   s star, u unread, c compose, arrows), compose with validation and a Sent copy. Layout adapts to its own
   width: 3 panes (folders | list | reader), 2 panes with a folder chip row, or one pane at a time. */
/* module-level on purpose: a component declared inside Webmail would remount on every render */
const Tb = ({ label, icon: I, onClick, disabled, active }) => (
  <Tooltip content={label}><Button variant="ghost" size="icon" className={cn('size-8', active && 'text-warn')} aria-label={label} disabled={disabled} onClick={onClick}><I className={cn(active && 'fill-current')} /></Button></Tooltip>
)
const FOLDERS = [['inbox', 'Inbox', Inbox], ['starred', 'Starred', Star], ['sent', 'Sent', Send], ['archive', 'Archive', Archive], ['trash', 'Trash', Trash2]]
export function Webmail({ height = 460, mobile: forceMobile }) {
  const box = useRef(null)
  const [w, setW] = useState(900)
  const [msgs, setMsgs] = useState(() => [...MESSAGES.map((m) => ({ ...m, folder: 'inbox', starred: false })), ...EXTRA_MESSAGES.map((m) => ({ starred: false, ...m }))])
  const [folder, setFolder] = useState('inbox')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(1)
  const [compose, setCompose] = useState(false)
  const [draft, setDraft] = useState({ to: '', subj: '', body: '' })
  const [draftErr, setDraftErr] = useState('')
  const picked = useRef(false)
  const mid = useRef(0)
  useLayoutEffect(() => {
    const measure = () => setW(box.current.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  const wide = !forceMobile && w >= 860
  const single = forceMobile || w < 640
  useLayoutEffect(() => { if (single && !picked.current) setSel(null) }, [single])

  const inFolder = (m, f) => (f === 'starred' ? m.starred && m.folder !== 'trash' : m.folder === f)
  const list = msgs.filter((m) => inFolder(m, folder) && (m.from + m.subj + m.prev + m.mail).toLowerCase().includes(q.toLowerCase()))
  const count = (f) => msgs.filter((m) => inFolder(m, f) && (f === 'inbox' ? m.unread : true)).length
  const cur = msgs.find((m) => m.id === sel)
  const open = (id) => { picked.current = true; setSel(id); setMsgs((a) => a.map((x) => (x.id === id ? { ...x, unread: false } : x))) }
  const nextAfter = (id) => { const i = list.findIndex((m) => m.id === id); return (list[i + 1] || list[i - 1] || {}).id ?? null }
  const patch = (id, fn) => setMsgs((a) => a.map((x) => (x.id === id ? fn(x) : x)))

  const moveTo = (id, to, label) => {
    const m = msgs.find((x) => x.id === id)
    if (!m) return
    const prev = { folder: m.folder, unread: m.unread }
    const nxt = nextAfter(id)
    patch(id, (x) => ({ ...x, folder: to }))
    setSel(single ? null : nxt)
    toast(label, { action: { label: 'Undo', onClick: () => patch(id, (x) => ({ ...x, ...prev })) } })
  }
  const remove = (id) => {
    const m = msgs.find((x) => x.id === id)
    if (!m) return
    if (m.folder === 'trash') {
      const at = msgs.indexOf(m), nxt = nextAfter(id)
      setMsgs((a) => a.filter((x) => x.id !== id)); setSel(single ? null : nxt)
      toast('Deleted permanently', { action: { label: 'Undo', onClick: () => setMsgs((a) => { const o = [...a]; o.splice(Math.min(at, o.length), 0, m); return o }) } })
    } else moveTo(id, 'trash', 'Moved to Trash')
  }
  const toggleStar = (id) => patch(id, (x) => ({ ...x, starred: !x.starred }))
  const markUnread = (id) => { patch(id, (x) => ({ ...x, unread: true })); if (single) setSel(null); toast('Marked as unread') }

  const send = () => {
    if (!/^\S+@\S+\.\S+$/.test(draft.to.trim())) { setDraftErr('Enter a valid recipient address'); return }
    const id = 1000 + (++mid.current)
    setMsgs((a) => [{ id, folder: 'sent', starred: false, from: 'You', mail: 'to: ' + draft.to.trim(), subj: draft.subj.trim() || '(no subject)', prev: draft.body.slice(0, 80) || '(empty)', time: 'now', unread: false, body: draft.body, att: [] }, ...a])
    setCompose(false); setDraft({ to: '', subj: '', body: '' }); setDraftErr('')
    toast.success('Sent (simulated)', { action: { label: 'View', onClick: () => { setFolder('sent'); setSel(id) } } })
  }
  const onKey = (e) => {
    /* never hijack browser/OS chords (Ctrl+C copy, Cmd+S, Alt+arrows...) */
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return
    const id = cur?.id
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const i = list.findIndex((m) => m.id === (document.activeElement?.dataset?.id ? +document.activeElement.dataset.id : sel))
      const n = list[Math.min(list.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))]
      const root = e.currentTarget
      if (n) { open(n.id); requestAnimationFrame(() => root.querySelector(`[data-id="${n.id}"]`)?.focus()) }
    } else if (e.key === 'c') { e.preventDefault(); setCompose(true) }
    else if (id && e.key === 'e') { e.preventDefault(); moveTo(id, 'archive', 'Archived') }
    else if (id && (e.key === '#' || e.key === 'Delete')) { e.preventDefault(); remove(id) }
    else if (id && e.key === 's') { e.preventDefault(); toggleStar(id) }
    else if (id && e.key === 'u') { e.preventDefault(); markUnread(id) }
    else if (e.key === 'Escape' && single && sel) setSel(null)
  }
  const renderFolders = (rail) => (
    <nav aria-label="Folders" className={cn(rail ? 'flex flex-col gap-0.5 p-2' : 'flex gap-1 overflow-x-auto border-b border-line p-2 [scrollbar-width:none]')}>
      {FOLDERS.map(([id, label, I]) => (
        <button key={id} onClick={() => { setFolder(id); setSel(null); picked.current = true }} aria-current={folder === id} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg text-[13px] transition-colors duration-150', rail ? 'h-8 px-2.5' : 'h-8 px-3', folder === id ? 'bg-white/[0.08] text-fg' : 'text-mute hover:bg-hover hover:text-fg')}>
          <I className="size-4" />{label}
          {count(id) > 0 && <span className={cn('font-mono text-[10.5px]', rail && 'ml-auto', id === 'inbox' ? 'text-fg' : 'text-dim')}>{count(id)}</span>}
        </button>
      ))}
    </nav>
  )

  const showList = !single || !cur
  const showReader = !single || !!cur
  /* single pane swaps the list out, which drops focus to <body>; keep it inside so Esc / shortcuts still work */
  useEffect(() => { if (single && cur && !box.current?.contains(document.activeElement)) box.current?.focus({ preventScroll: true }) }, [single, cur?.id])
  return (
    <div ref={box} tabIndex={-1} style={{ height }} onKeyDown={onKey} className="relative overflow-hidden rounded-xl border border-line-2 bg-card outline-none">
      <div className={cn('grid h-full', wide ? 'grid-cols-[168px_300px_minmax(0,1fr)]' : single ? 'grid-cols-1' : 'grid-cols-[300px_minmax(0,1fr)]')}>
        {wide && <div className="border-r border-line">{renderFolders(true)}</div>}
        {showList && (
          <div className="flex min-h-0 min-w-0 flex-col border-r border-line">
            {!wide && renderFolders(false)}
            <div className="flex items-center gap-2 border-b border-line p-2.5">
              <div className="relative min-w-0 flex-1"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mail" aria-label="Search mail" className="h-8 w-full rounded-lg border border-line bg-transparent pl-8 pr-2 text-[12.5px] outline-none transition-colors placeholder:text-dim hover:border-line-2 focus:border-white/30" /></div>
              <Button size="sm" onClick={() => setCompose(true)}><Plus />Compose</Button>
            </div>
            <div key={folder + q} className="anim-page min-h-0 flex-1 overflow-y-auto" role="listbox" aria-label="Messages">
              {list.length === 0 && <div className="grid h-full min-h-40 place-items-center px-6 text-center text-[13px] text-dim"><div><Inbox className="mx-auto mb-2 size-5" />{q ? <>No mail matches “{q}”</> : <>Nothing in {FOLDERS.find((f) => f[0] === folder)[1]}</>}</div></div>}
              {list.map((x) => (
                <button key={x.id} data-id={x.id} role="option" aria-selected={sel === x.id} onClick={() => open(x.id)} className={cn('w-full border-b border-line/50 px-4 py-3 text-left transition-colors duration-100 hover:bg-hover', sel === x.id && 'bg-white/[0.06] shadow-[inset_2px_0_0_var(--color-fg)]')}>
                  <div className="flex items-center gap-2"><span className={cn('size-1.5 shrink-0 rounded-full transition-colors duration-300', x.unread ? 'bg-[var(--brand)]' : 'bg-transparent')} /><span className={cn('min-w-0 flex-1 truncate text-[13px]', x.unread ? 'font-semibold' : 'text-mute')}>{x.from}</span>{x.starred && <Star className="size-3 shrink-0 fill-current text-warn" />}<span className="text-[11px] text-dim">{x.time}</span></div>
                  <div className="mt-0.5 truncate pl-3.5 text-[12.5px]">{x.subj}</div><div className="truncate pl-3.5 text-[12px] text-dim">{x.prev}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {showReader && (
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="flex items-center gap-0.5 border-b border-line px-2 py-1.5">
              {single && cur && <Button variant="ghost" size="sm" className="mr-1 h-8" onClick={() => setSel(null)}><ArrowLeft />Back</Button>}
              <Tb label="Archive (e)" icon={Archive} disabled={!cur || cur.folder === 'archive'} onClick={() => moveTo(cur.id, 'archive', 'Archived')} />
              <Tb label={cur?.folder === 'trash' ? 'Delete forever (#)' : 'Move to Trash (#)'} icon={Trash2} disabled={!cur} onClick={() => remove(cur.id)} />
              <Tb label="Mark as unread (u)" icon={MailOpen} disabled={!cur} onClick={() => markUnread(cur.id)} />
              <Tb label={cur?.starred ? 'Unstar (s)' : 'Star (s)'} icon={Star} active={cur?.starred} disabled={!cur} onClick={() => toggleStar(cur.id)} />
              <span className={cn('ml-auto hidden whitespace-nowrap px-2 font-mono text-[10px] uppercase tracking-[.06em] text-dim', wide && 'sm:block')}>e archive · # delete · s star · c compose</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {cur ? (
                <div key={cur.id} className="anim-page p-5">
                  <h3 className="text-base font-semibold leading-snug">{cur.subj}</h3>
                  <div className="mt-3 flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full border border-line-2 bg-white/5 text-xs">{cur.from[0]}</span><div className="min-w-0 text-[13px]"><div className="font-medium">{cur.from}</div><div className="truncate text-xs text-dim">{cur.mail}</div></div><span className="ml-auto text-xs text-dim">{cur.time}</span></div>
                  <p className="mt-5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg/85">{cur.body}</p>
                  {cur.att.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{cur.att.map((a) => <span key={a} className="inline-flex h-8 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12.5px]"><Paperclip className="size-3.5 text-dim" />{a}</span>)}</div>}
                  <div className="mt-6"><Button variant="outline" size="sm" onClick={() => { setDraft({ to: cur.mail.replace(/^to: /, ''), subj: 'Re: ' + cur.subj.replace(/^Re: /, ''), body: '' }); setCompose(true) }}><Reply />Reply</Button></div>
                </div>
              ) : <div className="grid h-full min-h-40 place-items-center text-dim"><div className="text-center"><Mail className="mx-auto mb-2 size-5" />Select a message</div></div>}
            </div>
          </div>
        )}
      </div>
      {compose && (
        <div className="anim-menu absolute bottom-3 right-3 z-10 w-[min(420px,calc(100%-1.5rem))] rounded-xl border border-line-2 bg-[#101012] shadow-2xl shadow-black/60" style={{ transformOrigin: '100% 100%' }} role="dialog" aria-label="New message" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setCompose(false) } }}>
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] font-medium">New message<button aria-label="Close" onClick={() => setCompose(false)} className="text-dim transition-colors hover:text-fg"><X className="size-4" /></button></div>
          <div className="space-y-2 p-3">
            <div><input autoFocus value={draft.to} onChange={(e) => { setDraft({ ...draft, to: e.target.value }); setDraftErr('') }} placeholder="To" aria-invalid={!!draftErr || undefined} className={inputCls(!!draftErr)} aria-label="To" />{draftErr && <p className="mt-1 text-[12px] text-bad">{draftErr}</p>}</div>
            <input value={draft.subj} onChange={(e) => setDraft({ ...draft, subj: e.target.value })} placeholder="Subject" className={inputCls()} aria-label="Subject" />
            <Textarea rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Write something…" />
          </div>
          <div className="flex items-center justify-between border-t border-line px-3 py-2.5"><Button variant="ghost" size="icon" aria-label="Attach"><Paperclip /></Button><Button onClick={send}><Send />Send</Button></div>
        </div>
      )}
    </div>
  )
}

/* ============================ Billing ============================ */
export const PaymentMethodCard = ({ brand = 'Visa', last = '4242', exp = '08/28', def }) => (
  <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4"><div className="grid h-8 w-12 place-items-center rounded-md border border-line-2 font-mono text-[10px] uppercase">{brand}</div><div className="flex-1"><div className="text-[13.5px] font-medium">•••• {last}</div><div className="text-xs text-dim">Expires {exp}</div></div>{def && <Badge tone="ok" dot={false}>Default</Badge>}<Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal /></Button></div>
)
export const CreditBalance = ({ amount, onAdd }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card p-5"><div><div className="font-mono text-[10.5px] uppercase tracking-[.08em] text-dim">Credit balance</div><div className="mt-2"><DotNum text={money(amount)} height={34} animate={false} /></div></div><Button onClick={onAdd}><Plus />Add funds</Button></div>
)
export const RenewalNotice = () => <InlineAlert tone="warn" title="2 services renew in the next 7 days" action={<Button size="sm" variant="outline">Review</Button>}>blipmade-prod and staging renew on Nov 14. Your balance covers $16.00 of $20.00.</InlineAlert>

/* ============================ Support ============================ */
export function TicketThread({ initial, agent = 'Maria · Support' }) {
  const [m, setM] = useState(initial)
  const [t, setT] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [m, typing])
  const send = async () => { const v = t.trim(); if (!v) return; setT(''); setM((a) => [...a, ['me', v, 'now']]); setTyping(true); await sleep(1400); setTyping(false); setM((a) => [...a, ['bot', 'Got it. I am checking this now and will reply here shortly.', 'now']]) }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {m.map(([w, x, ts], i) => <div key={i} className={cn('flex flex-col gap-1', w === 'me' ? 'items-end' : 'items-start')}><div className={cn('max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed', w === 'me' ? 'rounded-br-md bg-fg text-black' : 'rounded-bl-md border border-line bg-white/[0.03]')}>{x}</div><span className="px-1 text-[11px] text-dim">{w === 'me' ? 'You' : agent} · {ts}</span></div>)}
        {typing && <div className="flex gap-1 px-1 py-2">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-dim" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
        <div ref={end} />
      </div>
      <div className="flex items-end gap-2 border-t border-line p-3"><Textarea rows={1} className="max-h-28 min-h-9 flex-1" placeholder="Write a reply…" value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} /><Button size="icon" disabled={!t.trim()} onClick={send} aria-label="Send"><ArrowUp /></Button></div>
    </div>
  )
}
export function LiveChatWidget() {
  const [open, setOpen] = useState(true)
  return (
    <div className="w-80 overflow-hidden rounded-2xl border border-line-2 bg-card shadow-2xl shadow-black/60">
      <div className="flex items-center gap-3 border-b border-line p-3.5"><Orb size={32} state="idle" /><div className="flex-1"><div className="text-[13.5px] font-semibold">Blipmade support</div><div className="flex items-center gap-1.5 text-xs text-ok"><i className="size-1.5 rounded-full bg-ok" />Online · replies in ~2 min</div></div><button aria-label="Toggle" onClick={() => setOpen(!open)} className="text-dim hover:text-fg"><X className="size-4" /></button></div>
      {open && <div className="h-72"><TicketThread initial={[['bot', 'Hi! I am Maria. How can I help with your servers today?', '14:02']]} agent="Maria" /></div>}
    </div>
  )
}

/* ============================ Admin ============================ */
export const OrderTimeline = ({ events }) => (
  <ol className="relative space-y-4 border-l border-line-2 pl-5">
    {events.map(([t, d, ts, tone], i) => <li key={i} className="relative"><i className={cn('absolute -left-[25px] top-1.5 size-2 rounded-full ring-4 ring-card', tone === 'bad' ? 'bg-bad' : tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-fg')} /><div className="flex items-baseline justify-between gap-3"><span className="text-[13.5px] font-medium">{t}</span><span className="font-mono text-[11px] text-dim">{ts}</span></div>{d && <div className="text-[12.5px] text-dim">{d}</div>}</li>)}
  </ol>
)
export const InfrastructureNode = ({ n }) => {
  const off = n.status === 'offline'
  return (
    <div className={cn('rounded-xl border bg-card p-4', n.status === 'degraded' ? 'border-warn/40' : off ? 'border-bad/40' : 'border-line')}>
      <div className="flex items-center justify-between"><div><div className="font-mono text-[13px] font-medium">{n.id}</div><div className="text-xs text-dim">{n.region}</div></div><Badge tone={off ? 'bad' : n.status === 'degraded' ? 'warn' : 'ok'}>{n.status}</Badge></div>
      {off ? <div className="mt-4 rounded-lg bg-bad/[0.06] p-3 text-[12.5px] text-bad">No heartbeat for 2 h</div> : <><div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2"><DotGauge value={n.cpu} label="CPU" size={68} n={28} /><DotGauge value={n.ram} label="RAM" size={68} n={28} /><DotGauge value={n.disk} label="DISK" size={68} n={28} /></div><div className="mt-3 text-center text-[12px] text-dim">{n.vms} instances</div></>}
    </div>
  )
}
export const IncidentCard = ({ i }) => (
  <div className="rounded-xl border border-line bg-card p-4">
    <div className="flex items-start justify-between gap-3"><div><div className="font-mono text-[11px] text-dim">{i.id} · {i.when}</div><div className="mt-0.5 text-[14px] font-semibold">{i.t}</div></div><div className="flex gap-1.5"><Badge tone={i.sev === 'major' ? 'bad' : 'warn'}>{i.sev}</Badge><Badge dot={false}>{i.status}</Badge></div></div>
    <ol className="mt-3 space-y-1.5 border-l border-line-2 pl-3 text-[12.5px] text-mute">{i.updates.map((u, k) => <li key={k}>{u}</li>)}</ol>
  </div>
)
export const AuditEvent = ({ e }) => (
  <div className="flex items-start gap-3 border-b border-line/50 px-4 py-3 last:border-b-0"><span className="mt-1.5 size-1.5 rounded-full bg-dim" /><div className="min-w-0 flex-1"><div className="text-[13px]"><span className="font-medium">{e.actor}</span> <span className="font-mono text-[12px] text-info">{e.act}</span> <span className="text-mute">{e.target}</span></div>{e.diff && <div className="mt-0.5 font-mono text-[11.5px] text-dim">{e.diff}</div>}</div><div className="text-right font-mono text-[11px] text-dim">{e.when}<br />{e.ip}</div></div>
)
