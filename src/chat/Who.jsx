import { OrbX } from '../components/orbs.jsx'

/* who is speaking: a Blip character, or a person (initial + presence dot) */
export function Who({ who, size = 28, state = 'idle', live }) {
  if (who === 'operator') {
    return (
      <span className="relative grid shrink-0 place-items-center rounded-full border border-line-2 bg-[#1b1b1f] font-semibold text-fg" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
        M{live && <i className="absolute -bottom-px -right-px size-[28%] min-h-2 min-w-2 rounded-full border-2 border-[#0e0e10] bg-ok" />}
      </span>
    )
  }
  return <OrbX id="cast" role={who} size={size} state={state} />
}
