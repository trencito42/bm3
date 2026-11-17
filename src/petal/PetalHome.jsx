/* The Blipmade homepage, redesigned in Petal's visual language with Graphical's own devices (a scattered card deck
   that settles into a fan, inline icon-pills inside a sentence, a black terminal card, a rail-and-crossfade product
   explorer, a hairline accordion) rather than a generic three-card SaaS layout. Alloy's restraint shows in the
   components: plain surfaces, one neutral/accent action, label-top spacing.
   Reachable at /petal-home (inside this workspace's own frame) and standalone at /bare/petal-home. */
import { useEffect, useState } from 'react'
import { Deploy, Explorer, Faq, FinalCta, Footer, Hero, Included, Nav, PanelShowcase, Pricing } from './sections.jsx'
import './petal.css'

export default function PetalHome() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('petal-theme') || 'dark' } catch { return 'dark' } })
  useEffect(() => { try { localStorage.setItem('petal-theme', theme) } catch { /* private window */ } }, [theme])
  return (
    <div id="petal-scroll" data-theme={theme} className="petal h-full overflow-y-auto overflow-x-hidden">
      <Nav theme={theme} setTheme={setTheme} />
      <Hero />
      <Explorer />
      <Deploy />
      <Included />
      <PanelShowcase />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  )
}
