// Shared helpers for interpreting `fixtures.match_status` (api-football status.long values)
export const isFixtureNotStarted = (status) => status === 'Not Started'

// covers 'Match Finished', 'Match Finished After Extra Time', 'Match Finished After Penalty'
export const isFixtureFinished = (status) => Boolean(status) && status.startsWith('Match Finished')

export const isFixtureLive = (status) =>
  Boolean(status) && !isFixtureNotStarted(status) && !isFixtureFinished(status)

// home_score/away_score reflect the score after normal+extra time and never
// include a penalty shootout - home_penalty/away_penalty carry that
// separately, and are only non-null for a fixture decided on penalties.
export const formatScore = (fixture) => `${fixture.home_score} - ${fixture.away_score}`

// Penalty shootout line to render separately (below) the FT score, or null
// when the fixture wasn't decided on penalties.
export const formatPenaltyScore = (fixture) => {
  if (fixture.home_penalty == null || fixture.away_penalty == null) return null
  return `(${fixture.home_penalty}-${fixture.away_penalty} pens)`
}

// W/L/D for `clubId` in a finished fixture, from the club's perspective.
// Falls back to the penalty shootout score to break a tie when the fixture
// went to penalties - home_score/away_score alone would misreport a
// shootout loss as a draw.
export const getClubResult = (fixture, clubId) => {
  if (!isFixtureFinished(fixture.match_status)) return '-'

  let homeScore = fixture.home_score
  let awayScore = fixture.away_score
  if (homeScore === awayScore && fixture.home_penalty != null && fixture.away_penalty != null) {
    homeScore = fixture.home_penalty
    awayScore = fixture.away_penalty
  }

  if (homeScore === awayScore) return 'D'
  const homeWon = homeScore > awayScore
  const isHome = fixture.home_team_id === clubId
  return isHome === homeWon ? 'W' : 'L'
}
