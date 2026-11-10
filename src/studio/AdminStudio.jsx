/* The admin design showcase: every workflow section behind one switcher, so the whole admin can be reviewed (and previewed on a phone)
   from the workspace. The same components are mounted in the real /admin app. */
import { useEffect, useState } from 'react'
import { Select } from '../components/ui2.jsx'
import { Segmented } from '../components/ui.jsx'
import { eyebrow } from './kit.jsx'
import { CatalogStudio, Customers, Orders, Pricing, ProductEditor, Services } from './AdminCommerce.jsx'
import { Abuse, Automations, AuditLog, Backups, BotBuilder, Content, Incidents, Infra, Integrations, MailAdmin, Operations, Reports, Staff, SupportDesk, SupportStats } from './AdminOps.jsx'

export const ADMIN_SECTIONS = [
  ['Catalogue', [['catalog', 'Family studio', CatalogStudio], ['editor', 'Product and variant editor', ProductEditor], ['pricing', 'Pricing and promotions', Pricing]]],
  ['Customers', [['customers', 'Customers', Customers], ['orders', 'Orders and refunds', Orders], ['services', 'Services and VPS', Services]]],
  ['Platform', [['infra', 'Infrastructure and capacity', Infra], ['ops', 'Operations and queues', Operations], ['backups', 'Backups and recovery', Backups], ['incidents', 'Incidents', Incidents], ['abuse', 'Abuse enforcement', Abuse]]],
  ['People', [['staff', 'Staff and permissions', Staff]]],
  ['Support', [['desk', 'Support desk', SupportDesk], ['bots', 'Support bots', BotBuilder], ['automations', 'Automations', Automations], ['stats', 'Support numbers', SupportStats]]],
  ['Content', [['mail', 'Mail administration', MailAdmin], ['content', 'Email wording', Content]]],
  ['Insight', [['reports', 'Reports', Reports], ['audit', 'Audit log', AuditLog], ['integrations', 'Integrations', Integrations]]],
]
const FLAT = ADMIN_SECTIONS.flatMap(([, i]) => i)

export default function AdminStudio({ initial = 'catalog' }) {
  /* a section can be opened directly: #/frame/adminstudio?s=infra */
  const fromUrl = typeof location !== 'undefined' ? new URLSearchParams(location.hash.split('?')[1] || '').get('s') : null
  const [id, setId] = useState(FLAT.some((x) => x[0] === fromUrl) ? fromUrl : initial)
  useEffect(() => {
    const f = () => { const s = new URLSearchParams(location.hash.split('?')[1] || '').get('s'); if (FLAT.some((x) => x[0] === s)) setId(s) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  const S = FLAT.find((x) => x[0] === id)[2]
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3"><span className={eyebrow}>Section</span><div className="w-64"><Select value={id} onValueChange={setId} options={FLAT.map((x) => [x[0], x[1]])} /></div></div>
      <div key={id} className="step-in"><S /></div>
    </div>
  )
}
