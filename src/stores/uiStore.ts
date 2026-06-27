import { create } from "zustand";

export type EditingField = "title" | "note" | null;
export type ToastType = "error" | "info" | "success";

interface NewTaskMeta {
  stagger: number;
}

interface ToastState {
  message: string;
  type: ToastType;
}

interface UIState {
  activeTaskId: string | null;
  editingField: EditingField;
  undoTask: { id: string; title: string } | null;
  undoCallback: (() => void) | null;
  undoTimeoutId: ReturnType<typeof setTimeout> | null;
  toast: ToastState | null;
  toastTimeoutId: ReturnType<typeof setTimeout> | null;
  isOnline: boolean;
  syncQueueCount: number;
  newTaskMeta: Record<string, NewTaskMeta>;
  creationBurst: number;
  activateTask: (id: string, field: "title" | "note") => void;
  selectNote: (id: string) => void;
  clearEditing: () => void;
  clearActiveTask: () => void;
  registerNewTask: (id: string) => void;
  clearNewTask: (id: string) => void;
  showUndo: (id: string, title: string, onUndo: () => void) => void;
  clearUndo: () => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
  setOnline: (online: boolean) => void;
  setSyncQueueCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTaskId: null,
  editingField: null,
  undoTask: null,
  undoCallback: null,
  undoTimeoutId: null,
  toast: null,
  toastTimeoutId: null,
  isOnline: true,
  syncQueueCount: 0,
  newTaskMeta: {},
  creationBurst: 0,

  registerNewTask: (id) => {
    const burst = get().creationBurst;
    set({
      creationBurst: burst + 1,
      newTaskMeta: {
        ...get().newTaskMeta,
        [id]: { stagger: Math.min(burst % 4, 3) * 0.045 },
      },
    });
  },

  clearNewTask: (id) => {
    const next = { ...get().newTaskMeta };
    delete next[id];
    set({ newTaskMeta: next });
  },

  activateTask: (id, field) =>
    set({ activeTaskId: id, editingField: field }),

  selectNote: (id) => set({ activeTaskId: id, editingField: null }),

  clearEditing: () => set({ editingField: null }),

  clearActiveTask: () =>
    set({ activeTaskId: null, editingField: null }),

  showUndo: (id, title, onUndo) => {
    const { undoTimeoutId } = get();
    if (undoTimeoutId) clearTimeout(undoTimeoutId);

    const timeoutId = setTimeout(() => {
      set({ undoTask: null, undoCallback: null, undoTimeoutId: null });
    }, 4000);

    set({
      undoTask: { id, title },
      undoCallback: onUndo,
      undoTimeoutId: timeoutId,
    });
  },

  clearUndo: () => {
    const { undoTimeoutId } = get();
    if (undoTimeoutId) clearTimeout(undoTimeoutId);
    set({ undoTask: null, undoCallback: null, undoTimeoutId: null });
  },

  showToast: (message, type = "error") => {
    const { toastTimeoutId } = get();
    if (toastTimeoutId) clearTimeout(toastTimeoutId);

    const timeoutId = setTimeout(() => {
      set({ toast: null, toastTimeoutId: null });
    }, 5000);

    set({
      toast: { message, type },
      toastTimeoutId: timeoutId,
    });
  },

  clearToast: () => {
    const { toastTimeoutId } = get();
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    set({ toast: null, toastTimeoutId: null });
  },

  setOnline: (online) => set({ isOnline: online }),

  setSyncQueueCount: (count) => set({ syncQueueCount: count }),
}));
