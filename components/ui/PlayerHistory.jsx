import { StyleSheet, Text, View, Image, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// ─── helpers ────────────────────────────────────────────────────────────────

const isYouthTeam    = (name = '') => /U\d+|B$| B$|youth|reserve|academy/i.test(name)
const isNationalTeam = (name = '') =>
  /^(England|France|Spain|Germany|Brazil|Argentina|Portugal|Italy|Netherlands|Belgium|Croatia|Morocco|Senegal|Japan|USA)( U\d+)?$/i.test(name)

const seasonToDate = (season) => new Date(`${season}-08-01`)

const transferLabel = (type) => {
  if (type === 'Loan')           return ' (On Loan)'
  if (type === 'Back from Loan') return ' (Return)'
  return ''
}

const badgeForType = (type) => {
  if (!type || type === 'N/A' || type === 'Back from Loan') return null
  if (type === 'Loan')     return { label: 'Loan', bg: '#EEF4FF', color: '#3B5BDB' }
  if (type.match(/[€£$]/)) return { label: type,   bg: '#F0FDF4', color: '#166534' }
  return null
}

// ─── data merge ─────────────────────────────────────────────────────────────

/**
 * Group seasons by team into stint objects.
 * Used both for the full fallback (no transfers) and to enrich origin clubs.
 */
function buildStintsFromSeasons(seasons) {
  const map = {}
  for (const row of seasons) {
    if (!row.team_id || !row.league_name) continue   // skip null-league placeholders
    if (!map[row.team_id]) {
      map[row.team_id] = {
        team_id:     row.team_id,
        team_name:   row.team_name,
        season_from: row.season,
        season_to:   row.season,
      }
    } else {
      map[row.team_id].season_from = Math.min(map[row.team_id].season_from, row.season)
      map[row.team_id].season_to   = Math.max(map[row.team_id].season_to,   row.season)
    }
  }
  return Object.values(map)
}

function buildHistory(transfers, seasons) {
  // ── Zero-transfer path: one-club players or missing transfer data ──────────
  if (transfers.length === 0) {
    const stints = buildStintsFromSeasons(seasons)

    // The highest season across all stints = "still ongoing" marker
    const maxSeason = Math.max(...stints.map(s => s.season_to))

    return stints.map(s => ({
      key:          `season-only-${s.team_id}`,
      team_id:      s.team_id,
      team_name:    s.team_name,
      logo:         null,
      date:         null,
      year:         null,
      season_from:  s.season_from,
      season_to:    s.season_to,
      is_current:   s.season_to === maxSeason,
      transfer_type: null,
      badge:        null,
      suffix:       '',
      is_youth:     isYouthTeam(s.team_name),
      is_national:  isNationalTeam(s.team_name),
      is_origin:    false,
      sort_date:    seasonToDate(s.season_to),
    })).sort((a, b) => b.sort_date - a.sort_date)
  }

  // ── Normal path: player has at least one transfer ─────────────────────────
  const sorted    = [...transfers].sort((a, b) => new Date(a.date) - new Date(b.date))
  const teamInIds = new Set(transfers.map(t => t.team_in))

  // 1. One entry per transfer row
  const transferEntries = transfers.map(t => ({
    key:           `transfer-${t.id}`,
    team_id:       t.team_in,
    team_name:     t.club_in?.club_name ?? `Team ${t.team_in}`,
    logo:          t.club_in?.logo ?? null,
    date:          t.date,
    year:          new Date(t.date).getFullYear(),
    season_from:   null,
    season_to:     null,
    transfer_type: t.transfer_type,
    badge:         badgeForType(t.transfer_type),
    suffix:        transferLabel(t.transfer_type),
    is_youth:      false,
    is_national:   isNationalTeam(t.club_in?.club_name ?? ''),
    is_origin:     false,
    sort_date:     new Date(t.date),
  }))

  // 2. Origin club — team_out of earliest transfer that was never a team_in
  const originTransfer = sorted[0]
  const originTeamId   = originTransfer?.team_out
  const originEntries  = []

  if (originTeamId && !teamInIds.has(originTeamId)) {
    const originName    = originTransfer.club_out?.club_name ?? `Team ${originTeamId}`
    const originLogo    = originTransfer.club_out?.logo ?? null
    const originSeasons = seasons
      .filter(s => s.team_id === originTeamId && s.league_name)
      .map(s => s.season)
    const season_from   = originSeasons.length ? Math.min(...originSeasons) : null
    const season_to     = originSeasons.length ? Math.max(...originSeasons) : null

    originEntries.push({
      key:           `origin-${originTeamId}`,
      team_id:       originTeamId,
      team_name:     originName,
      logo:          originLogo,
      date:          null,
      year:          null,
      season_from,
      season_to,
      transfer_type: null,
      badge:         null,
      suffix:        '',
      is_youth:      isYouthTeam(originName),
      is_national:   isNationalTeam(originName),
      is_origin:     true,
      sort_date:     season_from
        ? seasonToDate(season_from)
        : new Date(new Date(originTransfer.date) - 1),
    })
  }

  // 3. Season-only backfill — youth/national teams absent from transfers entirely
  const allAccountedFor = new Set([...teamInIds, originTeamId].filter(Boolean))
  const seasonMap = {}

  for (const row of seasons) {
    if (!row.team_id || !row.league_name)   continue
    if (allAccountedFor.has(row.team_id))   continue
    if (!isYouthTeam(row.team_name) && !isNationalTeam(row.team_name)) continue

    if (!seasonMap[row.team_id]) {
      seasonMap[row.team_id] = {
        key:          `season-${row.team_id}`,
        team_id:      row.team_id,
        team_name:    row.team_name,
        logo:         null,
        date:         null,
        season_from:  row.season,
        season_to:    row.season,
        transfer_type: null,
        badge:        null,
        suffix:       '',
        is_youth:     isYouthTeam(row.team_name),
        is_national:  isNationalTeam(row.team_name),
        is_origin:    false,
        sort_date:    seasonToDate(row.season),
      }
    } else {
      const s = seasonMap[row.team_id]
      s.season_from = Math.min(s.season_from, row.season)
      s.season_to   = Math.max(s.season_to,   row.season)
      s.sort_date   = seasonToDate(s.season_to)
    }
  }

  return [...transferEntries, ...originEntries, ...Object.values(seasonMap)].sort(
    (a, b) => b.sort_date - a.sort_date
  )
}

// ─── sub-components ─────────────────────────────────────────────────────────

const Badge = ({ config, isYouth, isOrigin }) => {
  if (!config && !isYouth && !isOrigin) return null
  const { label, bg, color } = config
    ?? (isOrigin ? { label: 'First club', bg: '#F5F3FF', color: '#6D28D9' }
                 : { label: 'Academy',   bg: '#FFF7ED', color: '#9A3412' })
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

const HistoryRow = ({ entry }) => {
  const yearLabel = entry.date
    ? entry.year
    : entry.season_from == null
      ? '—'
      : entry.is_current
        ? `${entry.season_from}–Present`
        : entry.season_from === entry.season_to
          ? String(entry.season_from)
          : `${entry.season_from}–${entry.season_to}`

  return (
    <View style={styles.row}>
      <View style={styles.logoWrapper}>
        {entry.logo
          ? <Image source={{ uri: entry.logo }} style={styles.logo} resizeMode='contain' />
          : <View style={styles.logoPlaceholder} />
        }
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.clubName}>{entry.team_name}{entry.suffix}</Text>
        <Text style={styles.yearText}>{yearLabel}</Text>
      </View>

      <View style={styles.badges}>
        <Badge config={entry.badge} isYouth={entry.is_youth} isOrigin={entry.is_origin} />
      </View>
    </View>
  )
}

const Section = ({ title, data }) => {
  if (!data?.length) return null
  return (
    <>
      <Text style={styles.sectionLabel}>{title}</Text>
      {data.map(entry => <HistoryRow key={entry.key} entry={entry} />)}
    </>
  )
}

// ─── main component ─────────────────────────────────────────────────────────

export const PlayerHistory = ({ player }) => {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!player?.id) return

    const load = async () => {
      setLoading(true)

      const [transferRes, seasonRes] = await Promise.all([
        supabase
          .from('transfers')
          .select(`
            *,
            club_in:team_in(club_name, logo),
            club_out:team_out(club_name, logo)
          `)
          .eq('player_id', player.id)
          .order('date', { ascending: false }),

        supabase
          .from('player_seasons')
          .select('team_id, team_name, season, league_name')
          .eq('player_id', player.id),
      ])

      const merged = buildHistory(
        transferRes.data ?? [],
        seasonRes.data   ?? [],
      )

      setHistory({
        club:     merged.filter(e => !e.is_youth && !e.is_national),
        youth:    merged.filter(e =>  e.is_youth && !e.is_national),
        national: merged.filter(e =>  e.is_national),
      })
      setLoading(false)
    }

    load()
  }, [player])

  return (
    <View style={[styles.card, { flex: Platform.OS === 'web' ? 1 : 0 }]}>
      <Text style={styles.heading}>Career</Text>
      <View style={styles.divider} />

      <View style={styles.body}>
        {loading && <Text style={styles.muted}>Loading…</Text>}

        {!loading && history && (
          <>
            <Section title='Club career'   data={history.club} />
            <Section title='Youth career'  data={history.youth} />
            <Section title='International' data={history.national} />
          </>
        )}

        {!loading && history && !history.club.length && !history.youth.length && !history.national.length && (
          <Text style={styles.muted}>No career history available.</Text>
        )}
      </View>
    </View>
  )
}

export default PlayerHistory

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
  },
  heading: {
    fontSize: 22,
    fontFamily: 'supremeBold',
    padding: 20,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  body: {
    padding: 20,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'supreme',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 36,
    height: 36,
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  clubName: {
    fontSize: 15,
    fontFamily: 'supremeBold',
  },
  yearText: {
    fontSize: 13,
    fontFamily: 'supreme',
    color: '#6B7280',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'supremeBold',
  },
  muted: {
    color: '#9CA3AF',
    fontFamily: 'supreme',
    fontSize: 14,
  },
})