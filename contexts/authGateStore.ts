import {create} from 'zustand'

export const useAuthGateStore = create((set)=>({
    isOpen: false,
    open: () => set({isOpen: true}),
    close: () => set({isOpen: false}),
}))
