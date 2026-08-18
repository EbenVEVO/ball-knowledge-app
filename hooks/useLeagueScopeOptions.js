import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FEATURED_LEAGUE_IDS } from '@/lib/featuredLeagues'
import { buildScopeOptions } from '@/lib/leagueScope'

export function useLeagueScopeOptions() {
  const [options, setOptions] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchOptions = async () => {
      const { data } = await supabase.from('competitions').select('id, name').in('id', FEATURED_LEAGUE_IDS)
      if (cancelled) return
      const byId = Object.fromEntries((data ?? []).map(c => [c.id, c]))
      setOptions(buildScopeOptions(byId).filter(o => o.label))
    }

    fetchOptions()
    return () => { cancelled = true }
  }, [])

  return options
}
