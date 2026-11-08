import { useState } from 'react'
import { toast } from 'sonner'
import { Globe, Search } from 'lucide-react'
import { Badge, Button, Card, CardHeader, CardTitle, Input, PageHeader, StatusBadge, Switch } from '../components/ui.jsx'
import { DataTable, Select } from '../components/ui2.jsx'
import { useStore } from '../lib/store.jsx'
import { money, sleep } from '../lib/utils'
import { DNSRecordTable, SSLStatus } from '../components/product.jsx'

const TLD = [['.com', 12.99], ['.app', 14], ['.dev', 13], ['.io', 39], ['.cloud', 9.99], ['.net', 11.5], ['.xyz', 2.99]]
const hash = (s) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x }

export default function Domains() {
  const { domains, toggleDomain } = useStore()
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState({})
  const [dom, setDom] = useState('blipmade.app')

  const search = async (e) => {
    e.preventDefault()
    const name = q.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!name) return
    setBusy(true); setRes([])
    for (const [t, p] of TLD) {
      const d = name + t
      setRes((r) => [...r, { d, p, free: hash(d) % 5 !== 0 && name !== 'blipmade' }])
      await sleep(160)
    }
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Domains" description="Search, register and manage your names." />
      <Card>
        <CardHeader><CardTitle>Find a domain</CardTitle></CardHeader>
        <form onSubmit={search} className="flex gap-2 p-5">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" /><Input className="h-10 pl-9" placeholder="yourproject" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Domain name" /></div>
          <Button size="lg" className="h-10" disabled={busy}>Search</Button>
        </form>
        {res.length > 0 && (
          <div className="divide-y divide-line/60 border-t border-line">
            {res.map((r) => (
              <div key={r.d} className="anim-page flex items-center gap-4 px-5 py-3.5">
                <Globe className="size-4 text-dim" />
                <div className="flex-1"><div className="text-[13.5px] font-medium">{r.d}</div><div className="text-xs text-dim">{r.free ? 'Instant setup · free WHOIS privacy' : 'Registered by someone else'}</div></div>
                <StatusBadge status={r.free ? 'available' : 'taken'} />
                {r.free ? (<><span className="w-16 text-right tabular-nums">{money(r.p)}</span><Button size="sm" variant={added[r.d] ? 'secondary' : 'default'} onClick={() => { setAdded((a) => ({ ...a, [r.d]: true })); toast.success('Added to cart') }}>{added[r.d] ? 'Added' : 'Add'}</Button></>) : <span className="w-[136px]" />}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>Your domains</CardTitle></CardHeader>
        <div className="mt-3">
          <DataTable
            onRowClick={(r) => setDom(r.d)}
            columns={[
              { key: 'd', label: 'Domain', cell: (r) => <span className="font-medium">{r.d}</span> },
              { key: 'exp', label: 'Expires' },
              { key: 'auto', label: 'Auto-renew', cell: (r) => <span onClick={(e) => e.stopPropagation()}><Switch checked={r.auto} onCheckedChange={() => toggleDomain(r.d)} aria-label="Auto-renew" /></span> },
              { key: 's', label: 'Status', cell: () => <Badge tone="ok">Active</Badge> },
            ]}
            rows={domains.map((d) => ({ ...d, id: d.d }))}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div><CardTitle>DNS & SSL</CardTitle><div className="mt-1 text-xs text-dim">Select a domain above or here</div></div>
          <div className="w-48"><Select value={dom} onValueChange={setDom} options={domains.map((x) => x.d)} /></div>
        </CardHeader>
        <div className="space-y-5 p-5">
          <SSLStatus state={dom === 'portfolio.site' ? 'expiring' : 'valid'} />
          <DNSRecordTable key={dom} />
        </div>
      </Card>
    </>
  )
}
