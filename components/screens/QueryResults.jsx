import { View } from 'react-native'
import React from 'react'
import QueryAnswer from '../ui/QueryAnswer'
import QueryStatTable from '../ui/QueryStatTable'
import QueryLeaderboard from '../ui/QueryLeaderboard'
import QueryTeamCard from '../ui/QueryTeamCard'
import QueryStatHero from '../ui/QueryStatHero'
import QuerySuggestions from '../ui/QuerySuggestions'

// gameLog and seasonList both read naturally as a per-row table (QueryStatTable
// already hides the date/opponent columns when they're null), so they share
// the fallback rather than getting dedicated components.
const RESULT_COMPONENTS = {
  leaderboard: QueryLeaderboard,
  teamCard: QueryTeamCard,
  playerHero: QueryStatHero,
}

export const QueryResults = ({ data, question }) => {
  if (!data) return null
  const ResultComponent = RESULT_COMPONENTS[data.result_shape] ?? QueryStatTable

  return (
    <View style={{ gap: 20 }}>
      <QueryAnswer question={question} data={data} />
      {data.results?.length > 0 &&
        <ResultComponent
          results={data.results}
          highlightedStat={data.highlighted_stat}
          focusPlayerId={data.focus_player_id}
        />}
      {data.suggestions?.length > 0 &&
        <QuerySuggestions suggestions={data.suggestions} />}
    </View>
  )
}

export default QueryResults