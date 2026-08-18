// Vertical-field position map. X values are copied verbatim from LineupPlayer.jsx's
// gridPosition table (the vertical/non-horizontal branch). Y values are NOT copied verbatim -
// LineupPlayer.jsx's original y range (51-92) only spans one team's own half of a shared,
// two-team pitch (the away team mirrors into the other half). Team Builder renders a single
// team on a full pitch with no opponent, so that range is rescaled here (preserving the same
// relative row order/spacing) to span nearly the full pitch height instead of just half of it.
export const VERTICAL_PITCH_POSITIONS = {
  'GK':  { x: 50, y: 95 },

  'LB':  { x: 15, y: 74 },
  'LCB': { x: 35, y: 74 },
  'CB':  { x: 50, y: 74 },
  'RCB': { x: 65, y: 74 },
  'RB':  { x: 85, y: 74 },

  'LM':  { x: 12, y: 51 },
  'LCM': { x: 32, y: 51 },
  'CDM': { x: 50, y: 56 },
  'CM':  { x: 50, y: 56 },
  'RCM': { x: 68, y: 51 },
  'RM':  { x: 88, y: 51 },

  'LAM': { x: 18, y: 29 },
  'CAM': { x: 50, y: 29 },
  'RAM': { x: 82, y: 29 },

  'LW':  { x: 20, y: 10 },
  'LS':  { x: 38, y: 10 },
  'ST':  { x: 50, y: 10 },
  'RS':  { x: 62, y: 10 },
  'RW':  { x: 80, y: 10 },
}

// Clamps a 0-100 pitch-percentage value so it never resolves closer than insetPct% to the
// true 0%/100% boundary - e.g. GK at y=95 gets nudged up if insetPct > 5. Unlike a full-range
// rescale, values that are already outside that margin are left untouched, so roles nowhere
// near an edge (which is most of them) keep their exact authored position. Used by the export
// views to guarantee a marker's full height/width fits inside the pitch box even when the box
// itself gets clipped at its own edge (default insetPct=0 is a no-op, so existing on-screen
// callers are unaffected).
const insetPitchPct = (pct, insetPct) => Math.min(Math.max(pct, insetPct), 100 - insetPct)

// Absolute-position style for a role's slot, centered on its {x,y}% coordinate
export const getSlotStyle = (role, { boxWidth = 72, boxHeight = 84, edgeInsetPct = 0 } = {}) => {
  const { x, y } = VERTICAL_PITCH_POSITIONS[role] ?? { x: 50, y: 50 }
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${insetPitchPct(y, edgeInsetPct)}%`,
    transform: [
      { translateX: -boxWidth / 2 },
      { translateY: -boxHeight / 2 },
    ],
  }
}

// How much narrower the far (top/y=0) edge of the pitch is than the near (bottom/y=100) edge,
// as a fraction of width - this is what draws the trapezoid "looking up the pitch" 3D illusion
// used by the angled export view. 0 would be a plain rectangle.
export const PITCH_TOP_INSET_RATIO = 0.14

// Projects a point given in pitch-percentage space (0-100, same space VERTICAL_PITCH_POSITIONS
// uses) into pixel coordinates on a trapezoid pitch of the given width/height.
export const projectPitchPoint = (xPct, yPct, width, height) => {
  const v = yPct / 100
  const u = xPct / 100
  const inset = PITCH_TOP_INSET_RATIO * (1 - v)
  const left = width * inset
  const right = width * (1 - inset)
  return { x: left + u * (right - left), y: v * height }
}

// Pixel-position style (vs. getSlotStyle's percentage one) for a role's slot on an angled
// pitch of the given width/height, centered on its projected {x,y} coordinate. Markers
// themselves stay unrotated ("billboarded") on top of the projected pitch, matching the
// flat-sprite-on-perspective-floor look of typical lineup graphics.
export const getAngledSlotStyle = (role, width, height, { boxWidth = 72, boxHeight = 84, edgeInsetPct = 0 } = {}) => {
  const { x, y } = VERTICAL_PITCH_POSITIONS[role] ?? { x: 50, y: 50 }
  const { x: px, y: py } = projectPitchPoint(x, insetPitchPct(y, edgeInsetPct), width, height)
  return {
    position: 'absolute',
    left: px,
    top: py,
    transform: [
      { translateX: -boxWidth / 2 },
      { translateY: -boxHeight / 2 },
    ],
  }
}
