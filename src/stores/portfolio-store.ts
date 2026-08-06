import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio, TokenHolding } from "@/types";
import { getMockPortfolio, refreshTokenAnalysis } from "@/lib/mock-data";

interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  costBasisMap: Record<string, number>;
  setCostBasis: (tokenId: string, price: number) => void;
  loadPortfolio: () => Promise<void>;
  refreshToken: (tokenId: string) => void;
  refreshAll: () => Promise<void>;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: null,
      isLoading: false,
      costBasisMap: {},

      setCostBasis: (tokenId, price) => {
        set((state) => {
          const newMap = { ...state.costBasisMap, [tokenId]: price };
          if (state.portfolio) {
            const tokens = state.portfolio.tokens.map((t) =>
              t.id === tokenId ? { ...t, costBasis: price } : t
            );
            return {
              costBasisMap: newMap,
              portfolio: { ...state.portfolio, tokens },
            };
          }
          return { costBasisMap: newMap };
        });
      },

      loadPortfolio: async () => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        const portfolio = getMockPortfolio();
        const { costBasisMap } = get();
        const tokens = portfolio.tokens.map((t) => ({
          ...t,
          costBasis: costBasisMap[t.id] ?? t.costBasis,
        }));
        set({
          portfolio: { ...portfolio, tokens },
          isLoading: false,
        });
      },

      refreshToken: (tokenId) => {
        const { portfolio } = get();
        if (!portfolio) return;
        const tokens = portfolio.tokens.map((t) =>
          t.id === tokenId ? refreshTokenAnalysis(t) : t
        );
        set({
          portfolio: {
            ...portfolio,
            tokens,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      refreshAll: async () => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const { portfolio, costBasisMap } = get();
        if (!portfolio) {
          await get().loadPortfolio();
          return;
        }
        const tokens = portfolio.tokens.map((t) => {
          const refreshed = refreshTokenAnalysis(t);
          return {
            ...refreshed,
            costBasis: costBasisMap[t.id] ?? refreshed.costBasis,
          };
        });
        set({
          portfolio: {
            ...portfolio,
            tokens,
            lastUpdated: new Date().toISOString(),
          },
          isLoading: false,
        });
      },

      clearPortfolio: () => {
        set({ portfolio: null, isLoading: false });
      },
    }),
    {
      name: "bagguard-portfolio",
      partialize: (state) => ({ costBasisMap: state.costBasisMap }),
    }
  )
);
