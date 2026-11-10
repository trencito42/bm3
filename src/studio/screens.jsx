/* Registry of every composed screen. The workspace pages embed them; the /frame/:id route renders one on its own,
   which is also what the "Mobile" preview loads in an iframe, so media queries behave exactly as on a phone. */
import { lazy, Suspense } from 'react'
import { Skeleton } from '../components/ui2.jsx'

const L = (f, k) => lazy(() => f().then((m) => ({ default: m[k] || m.default })))
export const SCREENS = {
  deploy: L(() => import('./DeployStudio.jsx')),
  instance: L(() => import('./Instance.jsx')),
}

export function FrameScreen({ id }) {
  const S = SCREENS[id]
  return (
    <div className="min-h-dvh bg-bg p-4">
      <Suspense fallback={<div className="space-y-3 p-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}>
        {S ? <S hideSwitch={false} /> : <p className="p-6 text-dim">Unknown screen: {id}</p>}
      </Suspense>
    </div>
  )
}
export function Screen({ id, ...p }) {
  const S = SCREENS[id]
  return <Suspense fallback={<div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}><S {...p} /></Suspense>
}
