import { supabase } from './supabase'

// Shared fetch used by every screen that lists the featured games
export const fetchFeaturedGames = async () => {
  return supabase
    .schema('games')
    .from('games')
    .select('id, slug, name, tagline, icon_url, how_to_play, sort_order')
    .eq('is_active', true)
    .order('sort_order')
}

// Fetches today's XI puzzle (pool + fixture summary + per-side formation/attempt state) in one
// call. `data` is SQL NULL if no puzzle is published today.
export const fetchTodaysXIPuzzle = async () => {
  return supabase
    .schema('games')
    .rpc('xi_get_today_puzzle')
}

// Idempotent: creates the attempt row if missing, otherwise returns the existing row's current
// state untouched (including completed/failed/abandoned attempts) plus any already-guessed slots.
// `difficulty` only takes effect the first time a side is started — locked in at creation.
// `reveal` (full starting XI) is included whenever the attempt is completed/failed/abandoned.
export const startXIAttempt = async (poolId, teamSide, difficulty) => {
  return supabase
    .schema('games')
    .rpc('xi_start_attempt', { p_pool_id: poolId, p_team_side: teamSide, p_difficulty: difficulty })
}

// Returns { result, grid, player, correct_count, miss_count, miss_cap, status, reveal }.
export const submitXIGuess = async (attemptId, grid, guess) => {
  return supabase
    .schema('games')
    .rpc('xi_submit_slot_guess', { p_attempt_id: attemptId, p_grid: grid, p_guess: guess })
}

// Grants the next hint (1 or 2) for a slot, auto-determined server-side from hints_used. Costs a
// miss. Returns { hint_level, hint, grid, miss_count, miss_cap, status, reveal }; `reveal` is only
// set if this hint's miss pushed a hard-mode attempt to 'failed'. Errors if both hints for this
// slot are already used, or the attempt is no longer in_progress.
export const requestXIHint = async (attemptId, grid) => {
  return supabase
    .schema('games')
    .rpc('xi_use_slot_hint', { p_attempt_id: attemptId, p_grid: grid })
}

// Returns the attempt's full guesses array ({text, grid, result, player_id, ts} per entry),
// scoped to the calling user — used to rebuild the miss log when resuming an in-progress attempt.
export const fetchXIAttemptGuesses = async (attemptId) => {
  return supabase
    .schema('games')
    .rpc('xi_get_attempt_guesses', { p_attempt_id: attemptId })
}

// Easy-mode only (rejected server-side otherwise). Ends the attempt as 'abandoned' and returns
// the full revealed starting XI: { status, reveal: [...] }.
export const giveUpXIAttempt = async (attemptId) => {
  return supabase
    .schema('games')
    .rpc('xi_give_up_attempt', { p_attempt_id: attemptId })
}

// Shared "duel" engine (Climb the Ladder / Higher or Lower). Abandons any existing in-progress
// run for this game/user and starts fresh. Returns { run_id, game, score: 0, current: <card,
// revealed>, next: <card, hidden>, stat }. Card shape: { player_season_id, name, season, team,
// crest, competition, photo, stats }, where stats is null while hidden.
export const startDuelRun = async (game) => {
  return supabase
    .schema('games')
    .rpc('duel_start_run', { p_game: game })
}

// Resumes an in-progress duel run if one exists; `data` is SQL NULL otherwise. Same payload
// shape as startDuelRun's return value.
export const fetchCurrentDuelRun = async (game) => {
  return supabase
    .schema('games')
    .rpc('duel_get_current', { p_game: game })
}

// Climb the Ladder only. Submits a stat guess for the hidden ("next") card in a run — correct
// when the hidden card's value is >= the revealed card's (ties win). Correct returns { correct:
// true, stat, a_value, b_value, score, revealed: <old hidden card, now fully revealed>, current:
// <same as revealed>, next: <newly dealt hidden card> }. Incorrect returns { correct: false,
// stat, a_value, b_value, score, revealed, status: 'ended', best: <personal best score> }.
export const submitLadderStat = async (runId, stat) => {
  return supabase
    .schema('games')
    .rpc('ladder_submit_stat', { p_run_id: runId, p_stat: stat })
}

// Higher or Lower only. Submits a guess ('higher' | 'lower') for whether the hidden card's
// randomly-chosen stat (run.stat) is higher or lower than the revealed card's — strict
// inequality, ties are incorrect. Correct returns { correct: true, stat, a_value, b_value,
// score, revealed: <old hidden card, now fully revealed>, current: <same as revealed>, next:
// <newly dealt hidden card>, next_stat: <stat for the new round> }. Incorrect returns { correct:
// false, stat, a_value, b_value, score, revealed, status: 'ended', best }.
export const submitHigherLowerGuess = async (runId, guess) => {
  return supabase
    .schema('games')
    .rpc('hl_submit_guess', { p_run_id: runId, p_guess: guess })
}

// My Journey (career simulator). National-team clubs, one row per country — dedupe client-side.
export const fetchCareerNationalities = async () => {
  return supabase
    .from('clubs')
    .select('country')
    .eq('national_team', true)
    .order('country')
}

// Distinct positions the career stat engine knows how to weight (games.career_position_stat_profiles).
export const fetchCareerPositions = async () => {
  return supabase
    .schema('games')
    .from('career_position_stat_profiles')
    .select('position')
    .order('position')
}

// Creates the initial career state and returns the first prompt (academy pick).
export const startCareer = async (position, nationality) => {
  return supabase
    .schema('games')
    .rpc('start_career', { p_position: position, p_nationality: nationality })
}

// Advances the career by one season. `choice` is { club_id } when resolving an academy/transfer
// prompt, or null to roll the next season at the same club. Returns { state, event, next_prompt,
// career_complete }.
export const rollNextSeason = async (state, choice = null) => {
  return supabase
    .schema('games')
    .rpc('roll_next_season', { p_state: state, p_choice: choice })
}
