/* The workspace pages for the refinement stage: screen 30 (overview) and screen 31 (apps).
   Each one shows the real screen in the real shell, on a desktop and on a phone, and then
   says what changed and why. The frames are iframes, so the media queries, the sidebar
   and the bottom bar behave exactly as they do for a customer. */
import { useState } from 'react'
import { ExternalLink, Monitor, RotateCw, Smartphone } from 'lucide-react'
import { Button } from '../components/ui.jsx'
import { Doc } from './Doc.jsx'
import { cn } from '../lib/utils'

/* the two frames, side by side, with the state switch above them.
   The desktop frame has a width of its own (1280 by default) and lives in a box that
   scrolls sideways: a desktop layout seen in a narrow panel must still be the desktop
   layout, not the phone one squeezed into a column. */
function Frames({ path, states, defaultState = states[0][0] }) {
  const [state, setState] = useState(defaultState)
  const [run, setRun] = useState(0)
  const [width, setWidth] = useState('1024')
  const [phone, setPhone] = useState('390')
  const src = `${location.pathname}#${path}?s=${state}`
  const W = (options, value, onChange, label) => (
    <div role="group" aria-label={label} className="flex gap-1">
      {options.map((w) => (
        <button key={w} aria-pressed={value === w} onClick={() => onChange(w)} className={cn('h-8 rounded-full border px-2.5 font-mono text-[11px] outline-none transition-colors duration-150 focus-visible:border-white/50', value === w ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-dim hover:border-white/25 hover:text-fg')}>{w}</button>
      ))}
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="State" className="flex flex-wrap gap-1.5">
          {states.map(([q, l]) => (
            <button key={q} role="tab" aria-selected={state === q} onClick={() => { setState(q); setRun((n) => n + 1) }} className={cn('h-8 rounded-full border px-3 text-[12.5px] outline-none transition-[border-color,background-color,color] duration-150 focus-visible:border-white/50', state === q ? 'border-fg/70 bg-white/[0.07] text-fg' : 'border-line-2 text-mute hover:border-white/25 hover:text-fg')}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}><RotateCw />Reload</Button>
          <Button size="sm" variant="ghost" onClick={() => window.open(src, '_blank', 'noopener')}><ExternalLink />Open</Button>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_414px]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><Monitor className="size-3.5" />Desktop</span>
            {W(['768', '1024', '1280', '1440'], width, setWidth, 'Desktop width')}
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-[#050506] p-3">
            <iframe key={src + run + width} title="Desktop preview" src={src} className="block h-[880px] rounded-xl border border-line-2 bg-bg" style={{ width: width + 'px' }} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><Smartphone className="size-3.5" />Phone</span>
            {W(['320', '390', '440'], phone, setPhone, 'Phone width')}
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-[#050506] p-3">
            <iframe key={src + run + phone} title="Phone preview" src={src} className="block h-[780px] rounded-xl border border-line-2 bg-bg" style={{ width: phone + 'px', maxWidth: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const Changes = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-line">
    <table className="w-full min-w-[620px] text-[13.5px]">
      <thead><tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[.08em] text-dim"><th className="px-4 py-3 text-left font-normal">Before</th><th className="px-4 py-3 text-left font-normal">Now</th><th className="px-4 py-3 text-left font-normal">Why</th></tr></thead>
      <tbody className="[&_td]:border-b [&_td]:border-line/50 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_tr:last-child_td]:border-b-0">
        {rows.map(([a, b, c]) => <tr key={a}><td className="text-dim">{a}</td><td>{b}</td><td className="text-mute">{c}</td></tr>)}
      </tbody>
    </table>
  </div>
)

const Plan = ({ items }) => (
  <ul className="space-y-3 text-[14px] leading-relaxed text-mute">
    {items.map(([a, b]) => <li key={a}><b className="font-medium text-fg">{a}.</b> {b}</li>)}
  </ul>
)

/* what already existed in BM3, and what this stage adds */
const Parts = ({ items }) => (
  <ul className="space-y-2.5 text-[13.5px] leading-relaxed text-mute">
    {items.map(([name, kind, text]) => (
      <li key={name} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]', kind === 'new' ? 'border-[var(--brand)]/35 bg-[var(--brand)]/10 text-[var(--brand)]' : 'border-line-2 text-dim')}>{kind === 'new' ? 'new' : 'reused'}</span>
        <b className="font-medium text-fg">{name}</b>
        <span className="min-w-0">{text}</span>
      </li>
    ))}
  </ul>
)

/* ------------------------------------------------------------------ screen 30 */
export function OverviewDoc() {
  return (
    <Doc
      title="Overview, refined"
      lead="Screen 30. The customer overview, re-planned for a desktop and, separately, for a phone. The frames below are the real page inside the real shell: the sidebar on the left, the bottom bar on the phone. Press the buttons, the filters and the copy control."
      sections={[
        { id: 'screen', title: 'The screen', note: 'desktop and phone, same data', node: <Frames path="/preview/overview" states={[['attention', 'Needs you'], ['healthy', 'All healthy'], ['loading', 'Loading'], ['empty', 'New account'], ['error', 'Error']]} /> },
        { id: 'changes', title: 'What changed and why', node: <Changes rows={[
          ['Four KPI cards, each with a dot-matrix number', 'One infrastructure strip with plain figures, plus a separate platform card', 'The numbers on a dashboard should be read, not admired. The dot matrix stays for the greeting and for one headline.'],
          ['The greeting was fixed text and overflowed on a narrow screen', 'The greeting scales to the width it has and shortens a name that cannot fit', 'A name is data. It can be long, and it is never the reason a page scrolls sideways.'],
          ['Uptime sat next to the service metrics with the same weight', 'Platform health is its own card and says so; service health stays with the services', 'The platform being up says nothing about your database being up.'],
          ['Bandwidth, fleet gauges, services, invoices and uptime had no order', 'Status, then what needs you, then infrastructure, then usage, then services, then billing, then activity', 'The order of a page is the order of the questions.'],
          ['The invoice total appeared in a card and again in the list', 'The amount is in one place; the attention row points at it without repeating the figure', 'A number that appears twice is a number you stop trusting.'],
          ['Four big cards stacked on a phone', 'A two-column grid, then the things that need a hand, then the history', 'A phone shows the same truth, not the same layout squeezed.'],
          ['The whole page was a table of desktop panels', 'Cards that answer what it is, whether it runs, how to reach it, what it costs', 'Tables are for many rows. A phone has one thumb.'],
          ['Nothing said that the numbers were invented', 'A visible "simulated" mark and captions that name the scope of every figure', 'A design fixture must never be able to pass for a measurement.'],
        ]} /> },
        { id: 'plan', title: 'The information plan', node: <Plan items={[
          ['Kept', 'The greeting and the dot-matrix identity, the bandwidth curve, the uptime strip, the service list, the invoices, the support tickets.'],
          ['Moved', 'Fleet usage went from four ring gauges to four dot meters, so it fits a column and reads at a glance. Billing moved into its own band below the operational blocks.'],
          ['Gone', 'The second copy of the invoice total, the second copy of the service count, the unlabelled "region" idea - a runtime is not a place, so nothing pretends to be one.'],
          ['Added', 'An attention band that only exists when something is really wrong, a platform card that says what it measures, and captions that name the scope of every aggregate.'],
        ]} /> },
        { id: 'parts', title: 'What is reused, and what is new', node: <Parts items={[
          ['Panel, Button, Badge, InlineAlert, Skeleton, Segmented, DotBars, DotHeat', 'reused', 'The existing BM3 primitives. The band, the meters and the status label are built from them, not around them, so nothing in the customer app looks borrowed.'],
          ['AdaptiveGreeting', 'new', 'A dot-matrix greeting that measures the width it has, scales to it and shortens a name that cannot fit. It is built on the same dot-matrix idea as the brand mark, so the identity survives on a narrow screen.'],
          ['StatusStrip', 'new', 'One dot per service, coloured by state, with a legend that counts them. Thirteen services fit on one line; above that it collapses to a number.'],
          ['ResourceMeter and UsageMeters', 'new', 'Dot meters that name their scope, so "38% CPU" is never mistaken for a number about the account.'],
          ['AttentionCard', 'new', 'The band at the top. It renders nothing at all when there is nothing to do, so it can never become a permanent decoration.'],
          ['MetricCell, ServiceIdentity, ActivityRow, Caption, SimulatedNote', 'new', 'Small parts that keep the two screens consistent and keep every figure labelled as a fixture.'],
          ['AsyncActionButton, StatusTransition, InlineUndo, AnimatedValue, ContentReveal', 'new', 'The shared feedback layer in src/components/feedback.jsx. Screen 32 documents them one by one.'],
          ['Tokens and durations', 'new', 'src/design/tokens.css adds the density scale and the four durations this stage needs, on top of the easings BM3 already had.'],
        ]} /> },
        { id: 'port', title: 'What to port to production', node: <Plan items={[
          ['The order of the page', 'Status, then what needs you, then infrastructure, then usage, then services, then billing, then activity. The order is the order of the questions a customer asks.'],
          ['One number, one place', 'Uptime only in the platform card, tickets only in support, money only in billing, bandwidth only in the bandwidth panel. The phone shows today\'s bandwidth in the summary and the curve below it, which is a summary of the same figure, not a second figure.'],
          ['Platform health apart from service health', 'The platform card says in its own words that it measures Blipmade, not the customer. A tenant with its own status page needs a different label there, and that is a decision, not a bug.'],
          ['The phone as its own tree', 'Not the desktop layout at 390 px. The 2-by-2 summary, the platform strip, the curve, the meters, then the services, billing and history.'],
          ['Honest states', 'Loading, empty, error, healthy and attention are five different pages, not five words. The empty state explains what a service is and what deploying one costs.'],
          ['The fixtures', 'src/studio/fixtures.js is shared by both screens so the numbers cannot disagree with each other. In production it becomes the API, and the "simulated" mark becomes the real as-of time.'],
        ]} /> },
        { id: 'assumptions', title: 'Open questions and assumptions', node: <Plan items={[
          ['No production baseline', 'The customer app and its screenshots were not in this workspace, and there was no production source to read. Every "before" in the table above is the previous BM3 screen, not the live customer app. That comparison has to be redone against the real screens before anything is ported.'],
          ['A customer with services', 'The main view assumes an account that has something running. The empty state covers a new account; a customer with one service and a customer with two hundred will not get the same page, and the second case is not designed yet.'],
          ['Deliberate stops are not problems', 'A service that was stopped on purpose stays stopped and is counted apart. If the business wants stopped services in the running figure, the Infrastructure strip has to change, not the copy.'],
          ['The aggregates need an owner', 'Bandwidth per day, fleet usage and platform uptime each need a real source and a real refresh rate. Until then their shape is fixed but their values are fixtures.'],
          ['Money stays out of operations', 'The operational blocks never show a price and the billing block never shows a service state. If billing is ever merged into the service list, both rules go with it.'],
          ['The dot matrix is not a number font', 'It is used for the greeting and the brand mark. Metrics are read in a mono face with tabular numbers, so they can be compared.'],
        ]} /> },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ screen 31 */
export function AppsDoc() {
  return (
    <Doc
      title="Apps & databases, refined"
      lead="Screen 31. The same inventory page, re-planned: the composition is kept - a summary, a toolbar, rows that answer without opening - but the filters, the groups and the phone cards are different."
      sections={[
        { id: 'screen', title: 'The screen', note: 'desktop and phone, same data', node: <Frames path="/preview/apps" states={[['ready', 'Thirteen services'], ['loading', 'Loading'], ['empty', 'No services'], ['error', 'Error']]} /> },
        { id: 'changes', title: 'What changed and why', node: <Changes rows={[
          ['Product filters and operational filters in one row of chips', 'Two labelled groups: Product, then State', '"Applications" and "Running" answer different questions. Mixing them made both harder to use.'],
          ['A stopped service was grouped as "Needs you"', 'Stopped services are grouped together and labelled "stopped by you", with a note that they keep their disk', 'Stopping something on purpose is not a problem, and the page should not make it look like one.'],
          ['The address only appeared on a desktop', 'The address is on the phone too, quiet and monospaced, with a copy that answers on the control', 'A phone user needs the address as much as a desktop user.'],
          ['Everything except Start sat behind the three dots', 'Open, Connect, Join and Start are on the row; the rest stays in the menu', 'The common thing is one press away. The rare thing is still reachable.'],
          ['Rows on a phone were desktop rows with columns removed', 'A card per service: what it is, whether it runs, how to reach it, what it costs, what can be done', 'A table is for many things; a phone has one thumb and one column.'],
          ['The plan and the size were one line of text', 'The plan is its own column on a desktop, and a disclosure on a phone', 'Secondary detail is still there, one press away.'],
          ['No empty state for a category without services', 'A real empty state that says what a database is and what deploying one costs', 'An empty list is an answer, not an absence.'],
        ]} /> },
        { id: 'plan', title: 'The information plan', node: <Plan items={[
          ['Kept', 'The summary line, the search field, the chip filters, the sort control, the groups, the price column, the row menu, the access-code line.'],
          ['Moved', 'The state of a service is its own column, so the eye does not have to read a dot next to a name. The product group filters by type, not by icon.'],
          ['Gone', 'The grouped "Needs you" for stopped services, and the address column that the phone did not have.'],
          ['Added', 'A state for every condition that exists: running, stopped, provisioning, failed, suspended, cancelled - and a copy control that stays on the row.'],
        ]} /> },
        { id: 'parts', title: 'What is reused, and what is new', node: <Parts items={[
          ['Panel, Button, Input, Menu, Tooltip, InlineAlert, MatrixLoader', 'reused', 'The existing BM3 primitives. The list still looks like a BM3 list; it is not a new design system wearing a BM3 shirt.'],
          ['SmartMenu', 'new', 'One list of actions, two surfaces: a menu beside the row on a desktop, a bottom sheet with 48 px rows on a phone. The items and their order are written once, so a phone can never end up with fewer actions.'],
          ['BottomSheet and SheetItem', 'new', 'The phone surface for filters, sorting and row actions, with a backdrop, a focus trap and Escape.'],
          ['StatusTransition', 'new', 'One component decides how every state looks: a spinner while it works, a green dot when it runs, grey when you stopped it, red when it failed and it needs you.'],
          ['UsageMeters, dense', 'new', 'The dot meters in a variant that fits a table column, so the desktop row can show the same two figures as the phone card.'],
          ['ServiceIdentity', 'new', 'The icon, the name and the product line, so an app, a database and a game server are told apart at a glance and never by their kind alone.'],
          ['CopyFeedback', 'new', 'The address with a copy that answers on the control itself, and says so when the clipboard is blocked instead of pretending.'],
          ['AsyncActionButton', 'new', 'The retry on a failed service. The success only appears after the mocked work has finished, and the button keeps its width in every state.'],
        ]} /> },
        { id: 'port', title: 'What to port to production', node: <Plan items={[
          ['Two questions, two groups of filters', 'Product and State are separate on a desktop and separate blocks inside one sheet on a phone. The product list comes from the catalogue, the state list from the inventory.'],
          ['The sheet on a phone', 'State filters first, then the sort order, in one sheet that a thumb can reach. The product chips stay on the page, because they are the most common filter.'],
          ['The groups', 'Needs you, Running, Preparing, Stopped by you. A stopped service is never put in "Needs you", and it keeps its disk and its address.'],
          ['The primary action per row', 'Open, Connect, Join, Start, Retry, Preparing - one button that changes with the service and its state. Everything else stays in the menu.'],
          ['Optimistic power transitions', 'The row changes at once, the operation settles after, and a failure is visible instead of silent.'],
          ['The copy control', 'Always on the row, on the phone too, answering on the control.'],
        ]} /> },
        { id: 'assumptions', title: 'Open questions and assumptions', node: <Plan items={[
          ['No production baseline', 'The customer app and its screenshots were not in this workspace, and there was no production source to read. The "before" column above is the previous BM3 list screen, not the live customer app.'],
          ['What a stopped service costs', 'The note says a stopped service is not billed for CPU. Whether the disk still costs anything is a billing decision and is not answered here; if it does, the note has to say so.'],
          ['Starting a service again', 'The demo assumes a stopped service can be started with the plan it has. In production, if the plan expired while it was stopped, the action has to become "change plan" instead.'],
          ['Sortable by usage', 'Sorting by usage uses the current CPU and memory figures, which is the least stable number on the row. It is useful for a spot check, not for a report.'],
          ['One address per service', 'A database is shown by its host, not by its full DSN. The DSN is one press away in the details, and a full connection string does not fit in a table cell.'],
          ['Empty means empty', 'The empty state is for an account with no services at all. A filter that matches nothing is a different case, and it has its own message and a way back.'],
        ]} /> },
      ]}
    />
  )
}
