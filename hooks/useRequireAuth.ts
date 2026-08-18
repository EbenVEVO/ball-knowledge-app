import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthGateStore } from '@/contexts/authGateStore'

export function useRequireAuth() {
  const { session } = useAuth()
  const open = useAuthGateStore((s: any) => s.open)

  return useCallback((action: () => void) => {
    if (!session) {
      open()
      return
    }
    action()
  }, [session, open])
}
