import { create } from "zustand";

type Log = {
  message: string;
  time: string; // JSON stringified full data
};

type LogState = {
  logs: Log[];
  isLoading: boolean;
  addLog: (Log: Log) => void;
  clearLogs: () => void;
};

export const useLogStore = create<LogState>()((set, get) => ({
  logs: [],
  isLoading: false,

  addLog: (log) => {
    set((state) => {
      return { logs: [...state.logs, log] };
    });
  },

  clearLogs: () => set({ logs: [] })

}));
