/* Registry of every composed screen. The workspace pages embed them; the /frame/:id route renders one on its own,
   which is also what the "Mobile" preview loads in an iframe, so media queries behave exactly as on a phone. */
import { lazy, Suspense } from 'react'
import { MatrixLoader } from '../components/ui2.jsx'

const L = (f, k) => lazy(() => f().then((m) => ({ default: m[k] || m.default })))
export const SCREENS = {
  deploy: L(() => import('./DeployStudio.jsx')),
  instance: L(() => import('./Instance.jsx')),
  vps: L(() => import('./Vps.jsx')),
  mail: L(() => import('./Mail.jsx')),
  billing: L(() => import('./Billing.jsx')),
  adminstudio: L(() => import('./AdminStudio.jsx')),
  /* the refinement stage: screen 30 (overview), 31 (apps & databases) and 32 (the motion lab).
     They live next to the product screens so they can be compared with them side by side. */
  'overview-polish': L(() => import('./OverviewPolish.jsx')),
  'apps-polish': L(() => import('./AppsPolish.jsx')),
  'motion-lab': L(() => import('./MotionLab.jsx')),
}
const wait = <MatrixLoader label="Loading the screen" />

export function FrameScreen({ id }) {
  const S = SCREENS[id]
  return (
    <div className="min-h-dvh bg-bg p-4">
      <Suspense fallback={wait}>{S ? <S hideSwitch={false} /> : <p className="p-6 text-dim">Unknown screen: {id}</p>}</Suspense>
    </div>
  )
}
export function Screen({ id, ...p }) {
  const S = SCREENS[id]
  return <Suspense fallback={wait}><S {...p} /></Suspense>
}
