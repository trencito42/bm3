/* Screen 30 - Overview, refined.
   What this screen is trying to be: one page that answers "is my account fine, what needs
   me, what am I running, how is it doing, what does it cost, what happened" - in that
   order, and without saying the same number twice.

   The desktop and the phone are not the same layout at two widths. On a phone the order is
   different, the numbers are a two-column grid instead of four big cards, and the parts
   that need a hand (attention, billing) come before the parts that are only interesting.

   Every figure comes from ./fixtures.js and is a design fixture, not a measurement. */
import * as React from 'react'
import { Activity, ArrowRight, CreditCard, LifeBuoy, Plus, Receipt, RotateCw, Server, Ticket, Zap } from 'lucide-react'
import { Button, Card, CardBody, Segmented } from '../components/ui.jsx'
import { Skeleton } from '../components/loaders.jsx'
import { DotBars, DotHeat } from '../components/DotViz.jsx'
import { Panel } from './kit.jsx'
import { AdaptiveGreeting, ActivityRow, AttentionCard, Caption, MetricCell, ResourceMeter, ServiceIdentity, SimulatedNote, StatusStrip, UsageMeters, eyebrow } from '../components/refine.jsx'
import { AnimatedValue, AsyncActionButton, InlineUndo, StatusTransition, useMediaQuery } from '../components/feedback.jsx'
import { ACCOUNT, ACTIVITY, BANDWIDTH, BANDWIDTH_TOTAL, FLEET, INVENTORY, INVOICES, TICKETS, UPTIME, counts, eur, monthlyTotal } from './fixtures.js'
import { cn } from '../lib/utils'

const ACTIVITY_ICON = { restart: RotateCw, invoice: Receipt, ticket: LifeBuoy, deploy: Zap, domain: Activity, user: Server }

/* what the page shows, per state */
function useData(state) {
  return React.useMemo(() => {
    const healthy = state === 'healthy'
    const attention = healthy ? [] : [
      { id: 'inv', title: 'Invoice INV-1047 is overdue', note: 'minecraft-survival · €9.00 · 12 days late', action: 'Pay now' },
      { id: 'db', title: 'mysql-analytics failed to start', note: 'Migration 0042 failed on the analytics schema', action: 'Open logs' },
    ]
    /* In the healthy state the failed service is running again and the one that
       was still being set up has finished. The two services that were stopped
       on purpose stay stopped: a deliberate stop is not a problem, so the
       headline can honestly say that nothing waits for you. */
    const services = healthy
      ? INVENTORY.map((s) => (s.status === 'failed' || s.status === 'provisioning' ? { ...s, status: 'running', failure: undefined } : s))
      : INVENTORY
    const running = services.filter((s) => s.status === 'running').length
    /* A healthy account has nothing open either: the invoice is settled and the
       ticket has been answered. Otherwise the page would say "nothing waits for
       you" while two panels below say that it does. */
    const outstanding = healthy ? [] : INVOICES.outstanding
    const tickets = healthy ? TICKETS.map((t) => (t.waiting ? { ...t, waiting: false, status: 'answered', note: 'Answered by us. Nothing to do.' } : t)) : TICKETS
    return {
      headline: healthy
        ? 'Everything is running as expected. Nothing waits for you.'
        : 'Two things need you. The rest of your infrastructure is healthy.',
      attention,
      services,
      outstanding,
      tickets,
      waitingTickets: tickets.filter((t) => t.waiting).length,
      running,
      total: services.length,
      stopped: services.filter((s) => s.status === 'stopped').length,
      failed: services.filter((s) => s.status === 'failed').length,
      provisioning: services.filter((s) => s.status === 'provisioning').length,
    }
  }, [state])
}

/* ------------------------------------------------------------------ parts */
function InfrastructureStrip({ d }) {
  const cells = [
    { label: 'Running', value: `${d.running} of ${d.total}`, note: d.stopped ? `${d.stopped} stopped by you` : 'everything is up', tone: d.failed ? 'bad' : undefined },
    { label: 'Applications', value: counts.apps, note: 'Node.js, WordPress, Go, bots' },
    { label: 'Databases', value: counts.dbs, note: 'PostgreSQL, MySQL' },
    { label: 'Game servers', value: counts.games, note: 'Counter-Strike 2, Minecraft' },
  ]
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cells.map((c) => <MetricCell key={c.label} label={c.label} value={c.value} note={c.note} tone={c.tone} />)}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <div className={cn(eyebrow, 'mb-2')}>All {d.total} services</div>
        <StatusStrip services={d.services} />
      </div>
    </>
  )
}

function PlatformStatus() {
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <AnimatedValue value={UPTIME.value} format={(v) => v} className="text-[26px] font-semibold leading-none tracking-tight text-fg" />
        <span className={eyebrow}>Blipmade platform · 90 days</span>
      </div>
      <div className="mt-3.5">
        <DotHeat n={UPTIME.days} incidents={UPTIME.incidents} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-dim">
        <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-ok" />Operational</span>
        <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-warn" />Degraded</span>
        <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-bad" />Outage</span>
        <span className="ml-auto">{UPTIME.degraded} degraded days · {UPTIME.outages} outage</span>
      </div>
      <Caption className="mt-3">This is the platform, not your services. The health of each service is in the list below.</Caption>
    </>
  )
}

function FleetUsage() {
  return (
    <>
      <div className="space-y-2.5">
        <ResourceMeter label="CPU" value={FLEET.cpu} />
        <ResourceMeter label="RAM" value={FLEET.ram} />
        <ResourceMeter label="DISK" value={FLEET.disk} />
        <ResourceMeter label="Network" value={FLEET.net} />
      </div>
      <Caption className="mt-3">Average across {FLEET.count} running services. One service can be much higher: peak CPU {FLEET.peakCpu}, peak RAM {FLEET.peakRam}.</Caption>
    </>
  )
}

function Bandwidth({ range, setRange }) {
  const data = BANDWIDTH[range]
  const peak = Math.max(...data)
  const avg = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={range} onValueChange={(v) => v && setRange(v)} options={[['14', '14D'], ['30', '30D'], ['60', '60D']]} />
        <span className="font-mono text-[11.5px] tabular-nums text-dim">{BANDWIDTH_TOTAL[range] >= 1000 ? (BANDWIDTH_TOTAL[range] / 1000).toFixed(2) + ' TB' : BANDWIDTH_TOTAL[range] + ' GB'} in {range} days</span>
      </div>
      <div className="mt-3">
        <DotBars values={data} rows={9} unit="GB" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-dim">
        <span>Peak <b className="font-medium tabular-nums text-fg">{peak} GB</b></span>
        <span>Average <b className="font-medium tabular-nums text-fg">{avg} GB</b></span>
        <span>Hover or tap a column for the day</span>
      </div>
    </>
  )
}

function ServicePreview({ rows }) {
  return (
    <ul className="divide-y divide-line/60">
      {rows.map((s) => (
        <li key={s.id} className="flex items-center gap-3 py-2.5">
          <ServiceIdentity kind={s.kind} name={s.name} sub={s.product} status={s.status} />
          <span className="ml-auto hidden w-[150px] shrink-0 sm:block"><UsageMeters cpu={s.cpu} ram={s.ram} /></span>
          <span className="hidden w-[104px] shrink-0 md:block"><StatusTransition status={s.status} /></span>
          <span className="w-[74px] shrink-0 text-right font-mono text-[12.5px] tabular-nums text-fg">{s.price ? eur(s.price) : <span className="text-ok">Free</span>}</span>
          <ArrowRight className="size-3.5 shrink-0 text-dim" />
        </li>
      ))}
    </ul>
  )
}

function SupportList({ tickets }) {
  return (
    <ul className="divide-y divide-line/60">
      {tickets.map((t) => (
        <li key={t.id} className="flex items-start gap-3 py-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-line-2 bg-white/[0.03] text-mute"><Ticket className="size-[15px]" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] text-fg">{t.subject}</span>
            <span className="mt-0.5 block text-[12px] text-dim">{t.dept} · {t.when}</span>
          </span>
          {t.waiting ? <span className="shrink-0 rounded-full border border-info/25 bg-info/10 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[.06em] text-info">waiting</span> : <span className="shrink-0 font-mono text-[11px] text-dim">{t.status}</span>}
        </li>
      ))}
    </ul>
  )
}

function BillingPanel({ onPaid, outstanding }) {
  const owed = outstanding.reduce((a, i) => a + i.amount, 0)
  return (
    <Panel title="Billing" desc="What you owe and what you have paid" actions={<span className="font-mono text-[12px] tabular-nums text-fg">{eur(monthlyTotal)}<span className="text-dim"> / month</span></span>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={eyebrow}>Outstanding</h3>
            <span className={cn('font-mono text-[12px] tabular-nums', owed ? 'text-warn' : 'text-ok')}>{eur(owed)}</span>
          </div>
          {outstanding.length === 0 ? (
            <p className="mt-2 text-[12.5px] text-dim">Nothing outstanding. The next invoice is issued on the 1st.</p>
          ) : (
            <>
            <ul className="mt-2 divide-y divide-line/60">
              {outstanding.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12.5px] text-fg">{i.id}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-dim">{i.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-fg">{eur(i.amount)}</span>
                  <span className={cn('shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[.06em]', i.status === 'overdue' ? 'border-bad/30 bg-bad/10 text-bad' : 'border-warn/30 bg-warn/10 text-warn')}>{i.status}</span>
                </li>
              ))}
            </ul>
            <AsyncActionButton className="mt-3" variant="outline" icon={CreditCard} successLabel="Paid" pendingLabel="Paying…" onAction={onPaid}>Pay both invoices</AsyncActionButton>
            </>
          )}
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={eyebrow}>Recently paid</h3>
            <button className="text-[12.5px] text-dim hover:text-fg">All invoices</button>
          </div>
          <ul className="mt-2 divide-y divide-line/60">
            {INVOICES.paid.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[12.5px] text-fg">{i.id}</span>
                  <span className="mt-0.5 block text-[12px] text-dim">{i.date}</span>
                </span>
                <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-fg">{eur(i.amount)}</span>
                <span className="shrink-0 rounded-full border border-ok/25 bg-ok/10 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[.06em] text-ok">paid</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-dim">Credit on the balance: <b className="font-medium tabular-nums text-fg">{eur(ACCOUNT.credit)}</b></p>
        </div>
      </div>
    </Panel>
  )
}

function ActivityPanel() {
  return (
    <Panel title="Recent activity" desc="What happened on your account">
      <div className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
        {ACTIVITY.map((a) => (
          <ActivityRow key={a.id} icon={ACTIVITY_ICON[a.icon]} title={a.title} note={a.note} when={a.when} />
        ))}
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ desktop */
function Desktop({ d, range, setRange, onPaid }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <AdaptiveGreeting name={ACCOUNT.name} height={40} />
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-mute">{d.headline}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SimulatedNote />
          <Button variant="outline"><Plus />New service</Button>
        </div>
      </div>

      <AttentionCard items={d.attention} />

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7" title="Infrastructure" desc="Your services, counted once">
          <InfrastructureStrip d={d} />
        </Panel>
        <Panel className="lg:col-span-5" title="Platform status" desc="The Blipmade platform, not your services">
          <PlatformStatus />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-4" title="Fleet usage" desc="Average across your running services">
          <FleetUsage />
        </Panel>
        <Panel className="lg:col-span-8" title="Bandwidth" desc="Outbound traffic per day">
          <Bandwidth range={range} setRange={setRange} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-8" title="Your services" desc={`${d.running} running · ${d.total} in total`} actions={<button className="flex items-center gap-1 text-[12.5px] text-dim hover:text-fg">All {d.total} <ArrowRight className="size-3.5" /></button>}>
          <ServicePreview rows={d.services.slice(0, 5)} />
        </Panel>
        <Panel className="lg:col-span-4" title="Support" desc={d.waitingTickets ? `${d.waitingTickets} ticket waits for you` : 'No ticket waits for you'}>
          <SupportList tickets={d.tickets} />
        </Panel>
      </div>

      <BillingPanel onPaid={onPaid} outstanding={d.outstanding} />
      <ActivityPanel />
    </div>
  )
}

/* ------------------------------------------------------------------ phone */
function Phone({ d, range, setRange, onPaid }) {
  const today = BANDWIDTH[range][BANDWIDTH[range].length - 1]
  return (
    <div className="space-y-4 pb-4">
      <div>
        <AdaptiveGreeting name={ACCOUNT.name} height={26} />
        <p className="mt-2 text-[13px] leading-relaxed text-mute">{d.headline}</p>
      </div>

      <AttentionCard items={d.attention} />

      <div className="grid grid-cols-2 gap-2">
        <MetricCell label="Running" value={`${d.running}/${d.total}`} note={d.stopped ? `${d.stopped} stopped by you` : 'all healthy'} tone={d.failed ? 'bad' : undefined} />
        <MetricCell label="Tickets" value={d.waitingTickets} note={d.waitingTickets ? 'waiting for you' : 'none waiting'} />
        <MetricCell label="Uptime" value={UPTIME.value} note="platform · 90 days" />
        <MetricCell label="Bandwidth" value={`${today} GB`} note="today, outbound" />
      </div>

      <Panel title="Platform health" desc="Last 90 days">
        <DotHeat n={UPTIME.days} incidents={UPTIME.incidents} />
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-dim">
          <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-ok" />Operational</span>
          <span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-warn" />Degraded</span>
          <span className="ml-auto">{UPTIME.degraded} degraded days</span>
        </div>
      </Panel>

      <Panel title="Bandwidth" desc={`Outbound per day · last ${range} days`}>
        <Bandwidth range={range} setRange={setRange} />
      </Panel>

      <Panel title="Fleet usage" desc={`Average across ${FLEET.count} running services`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <ResourceMeter label="CPU" value={FLEET.cpu} />
          <ResourceMeter label="RAM" value={FLEET.ram} />
          <ResourceMeter label="Disk" value={FLEET.disk} />
          <ResourceMeter label="Net" value={FLEET.net} />
        </div>
      </Panel>

      <Panel title="Your services" desc={`${d.running} running · ${d.total} in total`} actions={<button className="text-[12.5px] text-dim hover:text-fg">All</button>}>
        <ul className="divide-y divide-line/60">
          {d.services.slice(0, 4).map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              <ServiceIdentity kind={s.kind} name={s.name} sub={s.product} status={s.status} />
              <span className="ml-auto shrink-0 text-right">
                <StatusTransition status={s.status} className="text-[12px]" />
                <span className="mt-0.5 block font-mono text-[11.5px] tabular-nums text-dim">{s.price ? eur(s.price) : 'Free'}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Billing" desc={`${eur(monthlyTotal)} / month`}>
        {d.outstanding.length === 0 ? (
          <p className="text-[12.5px] text-dim">Nothing outstanding. The next invoice is issued on the 1st.</p>
        ) : (
          <>
            <ul className="divide-y divide-line/60">
              {d.outstanding.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12.5px] text-fg">{i.id}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-dim">{i.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-fg">{eur(i.amount)}</span>
                </li>
              ))}
            </ul>
            <AsyncActionButton className="mt-3 w-full" variant="outline" icon={CreditCard} successLabel="Paid" pendingLabel="Paying…" onAction={onPaid}>Pay both invoices</AsyncActionButton>
          </>
        )}
      </Panel>

      <Panel title="Recent activity" desc="What happened on your account">
        {ACTIVITY.slice(0, 3).map((a) => (
          <ActivityRow key={a.id} icon={ACTIVITY_ICON[a.icon]} title={a.title} note={a.note} when={a.when} />
        ))}
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------ states */
function Loading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading the overview">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[78px]" />)}
      </div>
      <Skeleton className="h-[220px]" />
      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-[180px] lg:col-span-8" />
        <Skeleton className="h-[180px] lg:col-span-4" />
      </div>
    </div>
  )
}

function Empty() {
  return (
    <Card className="border-dashed">
      <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="grid size-11 place-items-center rounded-xl border border-line-2 bg-white/[0.04] text-mute"><Server className="size-5" /></span>
        <div className="text-[15px] font-semibold">Nothing on your account yet</div>
        <p className="max-w-sm text-[13px] leading-relaxed text-mute">Deploy an application, a game server or a database. It is online in about a minute, and this page fills up with it.</p>
        <Button className="mt-1"><Plus />Deploy something</Button>
      </CardBody>
    </Card>
  )
}

function Error() {
  return (
    <Card>
      <CardBody className="py-12 text-center">
        <div className="text-[15px] font-semibold">The overview could not load</div>
        <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-mute">Nothing is wrong with your services. This page just cannot reach the data right now.</p>
        <Button className="mt-4" variant="outline">Try again</Button>
      </CardBody>
    </Card>
  )
}

/* ------------------------------------------------------------------ screen */
export default function OverviewPolish({ state = 'attention', variant = 'auto' }) {
  const [range, setRange] = React.useState('30')
  const [undo, setUndo] = React.useState(null)
  const phone = useMediaQuery('(max-width: 767px)')
  const d = useData(state)
  const onPaid = async () => { await new Promise((r) => setTimeout(r, 900)); setUndo('Both invoices were marked as paid in this demo.') }

  if (state === 'loading') return <Loading />
  if (state === 'empty') return <Empty />
  if (state === 'error') return <Error />

  const Screen = variant === 'mobile' || (variant === 'auto' && phone) ? Phone : Desktop
  return (
    <>
      <Screen d={d} range={range} setRange={setRange} onPaid={onPaid} />
      {undo && <InlineUndo className="fixed inset-x-3 bottom-24 z-40 md:inset-x-auto md:right-6 md:bottom-6 md:w-96" message={undo} undoLabel="Undo" onUndo={() => setUndo(null)} />}
    </>
  )
}
