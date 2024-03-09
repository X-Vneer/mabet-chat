import { createStore } from "zustand/vanilla"

export type AppState = {
  drawer: string
}

export type AppActions = {
  setDrawer: (arg_0: string) => void
}

export type AppStore = AppState & AppActions

export const defaultInitState: AppState = {
  drawer: "",
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
  }))
}
