/* The Blipmade homepage, rebuilt on Graphical's/Alloy's actual devices (a scattered card deck that settles into a
   fan, inline icon-pills inside a sentence, a black terminal card, a rail-and-crossfade product explorer, a hairline
   accordion), but in BM3's own palette — near-black surfaces, one red accent reserved for the live/primary moment —
   not Petal's borrowed blue-on-grey admin colours. Petal supplied the structural law (no border, no shadow,
   background-step hierarchy, the motion easing); the brand is Blipmade's own, so there is no light mode here,
   matching the rest of this workspace.
   Reachable at /petal-home (inside this workspace's own frame) and standalone at /bare/petal-home. */
import { Deploy, Explorer, Faq, FinalCta, Footer, Hero, Included, Nav, PanelShowcase, Pricing } from './sections.jsx'
import './petal.css'

export default function PetalHome() {
  return (
    <div id="petal-scroll" className="petal h-full overflow-y-auto overflow-x-hidden">
      <Nav />
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
