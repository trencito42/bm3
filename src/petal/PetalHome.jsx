/* The Blipmade homepage, redesigned in Petal's visual language (flat, no borders/shadows/gradients, color-block
   hierarchy) with Graphical's composition pacing and Alloy's component polish folded in. Scoped entirely under
   the .petal class in petal.css: nothing here touches bm3's own tokens, routes or components, and nothing bm3
   already has (the real /site homepage, the app, the admin) changes because of this file.
   Reachable at /petal-home (inside this workspace's own frame, for comparison) and standalone at /bare/petal-home
   (what the frame previews load, and what an isolated production page would look like). */
import { useEffect, useState } from 'react'
import { Deploy, FinalCta, Footer, Hero, Nav, PanelShowcase, Pricing, Products } from './sections.jsx'
import './petal.css'

export default function PetalHome() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('petal-theme') || 'dark' } catch { return 'dark' } })
  useEffect(() => { try { localStorage.setItem('petal-theme', theme) } catch { /* private window */ } }, [theme])
  return (
    <div id="petal-scroll" data-theme={theme} className="petal h-full overflow-y-auto">
      <Nav theme={theme} setTheme={setTheme} />
      <Hero />
      <Products />
      <Deploy />
      <PanelShowcase />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  )
}
