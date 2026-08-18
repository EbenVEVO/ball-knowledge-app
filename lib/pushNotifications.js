import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { useNotificationPermissionStore } from '../contexts/notificationPermissionStore'
import { registerPushToken } from './notifications'

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

// Fetches the device's Expo push token and upserts it - only call once
// permission is already known to be granted (device + try/catch guarded
// here so both call sites below share the same failure handling).
const fetchAndRegisterToken = async () => {
  if (!Device.isDevice) return
  try {
    await ensureAndroidChannel()
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
    const { error } = await registerPushToken(token, Platform.OS)
    if (error) console.error(error)
  } catch (error) {
    console.error(error)
  }
}

// Explicit ask-flow - call only from the in-app explainer's "Enable" tap.
export const requestPermissionAndRegister = async () => {
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync()
  useNotificationPermissionStore.getState().setPermission(status, canAskAgain)
  if (status === 'granted') await fetchAndRegisterToken()
  return { status, canAskAgain }
}

// Sync-and-heal - safe to call opportunistically (mount, foreground, auth
// state change). Refreshes the store's permission status, and re-registers
// the token if permission already reads granted - this is what catches a
// user who granted permission via OS Settings directly, and gives free
// retry coverage if a prior registration RPC call failed transiently.
export const reregisterIfPermitted = async () => {
  if (Platform.OS === 'web') return
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync()
    useNotificationPermissionStore.getState().setPermission(status, canAskAgain)
    if (status === 'granted') await fetchAndRegisterToken()
  } catch (error) {
    console.error(error)
  }
}
