import { Platform } from 'react-native'
import { create } from 'zustand'

export const useNotificationPermissionStore = create<any>((set, get) => ({
    status: 'undetermined',
    canAskAgain: true,
    promptOpen: false,
    setPermission: (status: any, canAskAgain: any) => set({ status, canAskAgain }),
    openPrompt: () => set({ promptOpen: true }),
    closePrompt: () => set({ promptOpen: false }),
    promptIfNeeded: () => {
        if (Platform.OS === 'web') return
        if (get().status !== 'granted') set({ promptOpen: true })
    },
}))
