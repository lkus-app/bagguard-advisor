export type Recommendation =
  | "Avg Down"
  | "Avg Up"
  | "Cut Loss"
  | "Take Profit"
  | "Hold";

export type Chain = "solana" | "ethereum" | "bnb";

export interface Metrics {
  volumeScore: number;
  holderGrowthScore: number;
  concentrationScore: number;
  hypeScore: number;
  priceChange24h: number;
  priceChange7d: number;
}

export interface TokenMetrics {
  volume24h: number;
  volume7d: number;
  volumeTrend: "up" | "down" | "flat";
  socialVolume: number;
  sentimentScore: number;
  top10HoldersPct: number;
  top50HoldersPct: number;
  holderChange7d: number;
  holderChange30d: number;
}

export interface TokenHolding {
  id: string;
  chain: Chain;
  symbol: string;
  name: string;
  logo: string;
  mintOrAddress: string;
  amount: number;
  decimals: number;
  priceUsd: number;
  valueUsd: number;
  priceChange24h: number;
  priceChange7d: number;
  costBasis?: number;
  metrics: TokenMetrics;
  scores: {
    volumeScore: number;
    holderGrowthScore: number;
    concentrationScore: number;
    hypeScore: number;
    totalScore: number;
  };
  recommendation: Recommendation;
  reason: string;
}

export interface Portfolio {
  totalValueUsd: number;
  tokens: TokenHolding[];
  lastUpdated: string;
}

export interface WatchlistToken {
  id: string;
  chain: Chain;
  symbol: string;
  name: string;
  logo: string;
  mintOrAddress: string;
  priceUsd: number;
  priceChange24h: number;
  priceChange7d: number;
  metrics: TokenMetrics;
  scores: {
    volumeScore: number;
    holderGrowthScore: number;
    concentrationScore: number;
    hypeScore: number;
    totalScore: number;
  };
  recommendation: Recommendation;
  reason: string;
  addedAt: string;
}
