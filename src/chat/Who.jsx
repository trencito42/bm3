import { OrbX } from '../components/orbs.jsx'

/* who is speaking: a Blip character, or a person (initial + presence dot) */
export function Who({ who, size = 28, state = 'idle', live }) {
  if (who === 'operator') {
    return (
      /* a person is the one flat, light thing among glowing Blips: a paper-white disc with an initial */
      <span className="relative grid shrink-0 place-items-center rounded-full bg-fg font-semibold leading-none tracking-tight text-black shadow-[inset_0_-1px_0_rgba(0,0,0,.18)]" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
        M{live && <i className="absolute -bottom-0.5 -right-0.5 size-[30%] min-h-2.5 min-w-2.5 rounded-full border-2 border-[#0e0e10] bg-ok" />}
      </span>
    )
  }
  return <OrbX id="cast" role={who} size={size} state={state} />
}
