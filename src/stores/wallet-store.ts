import { create } from "zustand";

type Chain = "solana" | "ethereum" | "bnb" | "demo" | null;

interface WalletState {
  isConnected: boolean;
  isDemo: boolean;
  address: string | null;
  chain: Chain;
  setConnected: (address: string, chain: Chain, isDemo?: boolean) => void;
  setDisconnected: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  isDemo: false,
  address: null,
  chain: null,
  setConnected: (address, chain, isDemo = false) =>
    set({ isConnected: true, address, chain, isDemo }),
  setDisconnected: () =>
    set({ isConnected: false, isDemo: false, address: null, chain: null }),
}));
