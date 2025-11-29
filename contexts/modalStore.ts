import {create} from 'zustand'

export const usePlayerModalStore = create((set)=>({
    playerModalData:null,
    setPlayerModalData:(data: any) => set({playerModalData: data})
}))