import { createStore } from "zustand/vanilla"

export type AppState = {
  drawer: { type: string; payload: any }
  chatsQuery: string
}

export type AppActions = {
  setDrawer: (arg_0: { type: string; payload: any }) => void
  setChatsQuery: (arg_0: string) => void
}

export type AppStore = AppState & AppActions

export const defaultInitState: AppState = {
  drawer: { type: "", payload: "" },
  chatsQuery: "",
}
export const initAppStore = (): AppState => {
  return { ...defaultInitState }
}

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStore>()((set, get) => ({
    ...initState,
    setDrawer(newDrawerState) {
      set((state) => ({ drawer: newDrawerState }))
    },
    setChatsQuery(arg_0) {
      set((state) => ({ chatsQuery: arg_0 }))
    },
  }))
}
