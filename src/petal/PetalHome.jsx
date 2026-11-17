/* Scene 1 (nav, hero, the interface composition) is the part under review right now — see scene1.jsx for what
   changed and why. Everything from Explorer down is still the previous draft, unreviewed, kept only so the page
   doesn't dead-end; it will be reworked once scene 1 is accepted.
   Reachable at /petal-home (inside this workspace's own frame) and standalone at /bare/petal-home. */
import { Composition, Hero, Nav } from './scene1.jsx'
import { Deploy, Explorer, Faq, FinalCta, Footer, Included, PanelShowcase, Pricing } from './sections.jsx'
import './petal.css'

export default function PetalHome() {
  return (
    <div id="petal-scroll" className="petal h-full overflow-y-auto overflow-x-hidden">
      <Nav />
      <Hero />
      <Composition />
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
