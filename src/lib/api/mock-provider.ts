import type { Chain } from "@/types";
import type { DataProvider, MarketMetrics, WalletTokenBalance } from "./types";
import { getMockPortfolio } from "@/lib/mock-data";

export const mockProvider: DataProvider = {
  name: "mock",

  async getWalletBalances(
    _address: string,
    _chain: Chain
  ): Promise<WalletTokenBalance[]> {
    await new Promise((r) => setTimeout(r, 400));
    const portfolio = getMockPortfolio();
    return portfolio.tokens.map((t) => ({
      chain: t.chain,
      symbol: t.symbol,
      name: t.name,
      logo: t.logo,
      mintOrAddress: t.mintOrAddress,
      amount: t.amount,
      decimals: t.decimals,
      priceUsd: t.priceUsd,
      priceChange24h: t.priceChange24h,
      priceChange7d: t.priceChange7d,
    }));
  },

  async getTokenMetrics(
    mintOrAddress: string,
    _chain: Chain
  ): Promise<MarketMetrics | null> {
    await new Promise((r) => setTimeout(r, 200));
    const portfolio = getMockPortfolio();
    const token = portfolio.tokens.find(
      (t) => t.mintOrAddress === mintOrAddress
    );
    if (!token) return null;
    return {
      ...token.metrics,
      priceUsd: token.priceUsd,
      priceChange24h: token.priceChange24h,
      priceChange7d: token.priceChange7d,
    };
  },
};
