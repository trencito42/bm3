/* Workspace pages for the composed product screens. Each page is a Doc with the real screen in a window
   (desktop inline, mobile in an iframe) plus a short list of what the screen covers. */
import { Doc } from './Doc.jsx'
import { ScreenFrame } from '../studio/kit.jsx'
import { Screen } from '../studio/screens.jsx'

const Covers = ({ items }) => <ul className="grid gap-x-8 gap-y-2 text-[13.5px] text-mute sm:grid-cols-2">{items.map((i) => <li key={i} className="flex gap-2.5"><i className="mt-2 size-1 shrink-0 rounded-full bg-dim" />{i}</li>)}</ul>
const page = (title, lead, id, label, covers, height = 820) => function Page() {
  return <Doc title={title} lead={lead} sections={[{ id: 'screen', title: 'The screen', node: <ScreenFrame id={id} label={label} height={height}><Screen id={id} /></ScreenFrame> }, { id: 'covers', title: 'What it covers', node: <Covers items={covers} /> }]} />
}

export const InstancePage = page('Instance management', 'Everything a customer does with a running app, game server or database. Switch the kind to see how the tabs change. Try stopping it, editing a startup variable (a restart banner appears), opening a file, restoring a backup, deleting it.', 'instance', 'Instance', [
  'Overview with live resources, health and activity', 'Console with level and source filters, search, pause, history', 'File explorer, editor with live diff, permissions dialog', 'Git: deployments, rollback, failed build log, webhook secret',
  'Startup command and environment with a diff of pending changes', 'Schedules with a cron helper and task chains', 'Backups with storage meter, lock, restore flow and automatic policy', 'Databases: credentials, rotation, TLS, allowed addresses',
  'Network: ports and firewall', 'Access: people, role presets and a permission matrix', 'Game controls: Glitch advice, players, whitelist, server.properties', 'Settings: SFTP, resources, reinstall, transfer, delete'])
