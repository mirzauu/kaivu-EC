import { useSyncExternalStore } from "react";

type State = {
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
};

let state: State = {
  isAuthenticated: false,
  isAuthModalOpen: false,
};

let pendingAction: (() => void) | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const auth = {
  login() {
    state = { ...state, isAuthenticated: true, isAuthModalOpen: false };
    emit();
    if (pendingAction) {
      const action = pendingAction;
      pendingAction = null;
      action();
    }
  },
  logout() {
    state = { ...state, isAuthenticated: false };
    emit();
  },
  openModal(action?: () => void) {
    if (action) {
      pendingAction = action;
    }
    state = { ...state, isAuthModalOpen: true };
    emit();
  },
  closeModal() {
    pendingAction = null;
    state = { ...state, isAuthModalOpen: false };
    emit();
  },
};

export function useAuth<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
