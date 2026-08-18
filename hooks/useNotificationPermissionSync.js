import { useEffect } from 'react'
import { AppState } from 'react-native'
import { reregisterIfPermitted } from '../lib/pushNotifications'

// Keeps notification permission status (and the registered push token)
// fresh: once on mount, and again whenever the app returns to the
// foreground - covers a user who granted/revoked permission via OS Settings.
export function useNotificationPermissionSync() {
  useEffect(() => {
    reregisterIfPermitted()
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') reregisterIfPermitted()
    })
    return () => subscription.remove()
  }, [])
}
