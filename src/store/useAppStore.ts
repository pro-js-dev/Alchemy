import { create } from 'zustand'

interface AppState {
  // добавляйте состояние приложения сюда
}

export const useAppStore = create<AppState>()(() => ({
  // начальное состояние
}))
