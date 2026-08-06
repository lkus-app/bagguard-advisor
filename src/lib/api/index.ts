import type { Chain, TokenHolding } from "@/types";
import { analyzeToken } from "@/lib/scoring";
import type { DataProvider, WalletTokenBalance } from "./types";
import { mockProvider } from "./mock-provider";
import { birdeyeProvider } from "./birdeye-provider";

function getProvider(): DataProvider {
  if (process.env.NEXT_PUBLIC_BIRDEYE_API_KEY) {
    return birdeyeProvider;
  }
  return mockProvider;
}

export async function fetchPortfolioAnalysis(
  address: string,
  chain: Chain | "demo"
): Promise<TokenHolding[]> {
  const provider = chain === "demo" ? mockProvider : getProvider();
  const effectiveChain: Chain =
    chain === "demo" ? "solana" : (chain as Chain);

  const balances = await provider.getWalletBalances(address, effectiveChain);
  const filtered = balances.filter((b) => b.amount * b.priceUsd >= 30);

  const holdings: TokenHolding[] = await Promise.all(
    filtered.map(async (bal: WalletTokenBalance) => {
      const metrics = await provider.getTokenMetrics(
        bal.mintOrAddress,
        bal.chain
      );

      const rawMetrics = metrics ?? {
        volume24h: 0,
        volume7d: 0,
        volumeTrend: "flat" as const,
        socialVolume: 0,
        sentimentScore: 0,
        top10HoldersPct: 40,
        top50HoldersPct: 60,
        holderChange7d: 0,
        holderChange30d: 0,
      };

      const priceChange24h =
        metrics?.priceChange24h ?? bal.priceChange24h;
      const priceChange7d = metrics?.priceChange7d ?? bal.priceChange7d;
      const analysis = analyzeToken(rawMetrics, priceChange24h, priceChange7d);

      return {
        id: `${bal.chain}-${bal.mintOrAddress}`,
        chain: bal.chain,
        symbol: bal.symbol,
        name: bal.name,
        logo: bal.logo,
        mintOrAddress: bal.mintOrAddress,
        amount: bal.amount,
        decimals: bal.decimals,
        priceUsd: bal.priceUsd,
        valueUsd: bal.amount * bal.priceUsd,
        priceChange24h,
        priceChange7d,
        metrics: rawMetrics,
        scores: analysis.scores,
        recommendation: analysis.recommendation,
        reason: analysis.reason,
      };
    })
  );

  return holdings.sort((a, b) => b.valueUsd - a.valueUsd);
}

export { mockProvider, birdeyeProvider };
export type { DataProvider, WalletTokenBalance, MarketMetrics } from "./types";
