import { Doc } from './Doc.jsx'
import { ScreenFrame } from '../studio/kit.jsx'
import { Screen } from '../studio/screens.jsx'

export default function Deploy() {
  return (
    <Doc title="Deploy Studio" lead="One flow for every product: applications, bots and workers, game servers, databases, websites (Git or ZIP), VPS and email hosting. The steps change per product, the frame does not. Use the scenario switch to review a declined card and a region without capacity, with their retry paths." sections={[
      { id: 'studio', title: 'The flow', note: 'configure, review, pay, provision, result', node: <ScreenFrame id="deploy" label="Deploy Studio" height={820}><Screen id="deploy" /></ScreenFrame> },
      { id: 'notes', title: 'What each product asks for', node: (
        <div className="overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[560px] text-[13.5px]"><thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">Product</th><th className="px-4 py-3 text-left font-normal">Steps</th><th className="px-4 py-3 text-left font-normal">Ends with</th></tr></thead><tbody>{[['Application', 'Source, runtime, plan, environment, add-ons, domain', 'Address, build result'], ['Bot or worker', 'Source, runtime, plan, environment with token', 'Online, logs streaming'], ['Game server', 'Edition and version, plan, mods, add-ons', 'Connect address'], ['Database', 'Engine, plan, access, add-ons', 'Host and one-time credentials'], ['Website', 'Source (Git, ZIP, template), plan, domain', 'Address and HTTPS'], ['VPS', 'System, plan, SSH access, add-ons', 'IPv4 and first sign-in'], ['Email hosting', 'Domain, plan, first mailboxes', 'DNS records to add']].map(([a, b, c]) => <tr key={a} className="border-b border-line/50 last:border-b-0"><td className="px-4 py-3 font-medium">{a}</td><td className="px-4 py-3 text-mute">{b}</td><td className="px-4 py-3 text-mute">{c}</td></tr>)}</tbody></table></div>
      ) },
    ]} />
  )
}
