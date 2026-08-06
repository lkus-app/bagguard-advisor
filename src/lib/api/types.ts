import type { Chain, TokenMetrics } from "@/types";

/** Raw token balance from chain / indexer */
export interface WalletTokenBalance {
  chain: Chain;
  symbol: string;
  name: string;
  logo: string;
  mintOrAddress: string;
  amount: number;
  decimals: number;
  priceUsd: number;
  priceChange24h: number;
  priceChange7d: number;
}

/** Market + on-chain metrics from data providers */
export interface MarketMetrics extends TokenMetrics {
  priceUsd: number;
  priceChange24h: number;
  priceChange7d: number;
}

export interface DataProvider {
  name: string;
  getWalletBalances(
    address: string,
    chain: Chain
  ): Promise<WalletTokenBalance[]>;
  getTokenMetrics(
    mintOrAddress: string,
    chain: Chain
  ): Promise<MarketMetrics | null>;
}
