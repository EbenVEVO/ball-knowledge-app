// Fixed collage frames — order controls which zones are used first when there
// are fewer than 5 candidates, kept visually balanced (diagonal pair, then center, etc).
// Shared by the home preview collage and the following map, which tiles this
// same 5-slot frame in bands to keep the whole map feeling like a collage
// rather than a plain grid.
export const COLLAGE_ZONES = [
  { position: 'absolute', top: '4%', left: '2%', transform: [{ rotate: '-6deg' }] },
  { position: 'absolute', top: '54%', left: '52%', transform: [{ rotate: '-5deg' }] },
  { position: 'absolute', top: '38%', left: '28%', transform: [{ rotate: '-3deg' }] },
  { position: 'absolute', top: '2%', left: '54%', transform: [{ rotate: '5deg' }] },
  { position: 'absolute', top: '50%', left: '4%', transform: [{ rotate: '7deg' }] },
]

export const COLLAGE_BAND_HEIGHT = 260

export const shuffle = (array) => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Splits a shuffled pool into fixed-size bands so each band can be laid out
// with COLLAGE_ZONES, tiling the collage look across an arbitrarily long list.
export const chunkForCollage = (items, size = COLLAGE_ZONES.length) => {
  const bands = []
  for (let i = 0; i < items.length; i += size) {
    bands.push(items.slice(i, i + size))
  }
  return bands
}
