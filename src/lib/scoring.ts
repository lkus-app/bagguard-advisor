import type { Metrics, Recommendation, TokenMetrics } from "@/types";

export function computeScores(raw: TokenMetrics, priceChange24h: number, priceChange7d: number) {
  const volumeBase = Math.min(100, (Math.log10(Math.max(raw.volume24h, 1)) / 7) * 100);
  const trendBonus = raw.volumeTrend === "up" ? 15 : raw.volumeTrend === "down" ? -10 : 0;
  const volumeScore = Math.max(0, Math.min(100, volumeBase + trendBonus));

  const growth7d = Math.max(-50, Math.min(100, raw.holderChange7d * 2));
  const growth30d = Math.max(-30, Math.min(50, raw.holderChange30d));
  const holderGrowthScore = Math.max(0, Math.min(100, 50 + growth7d * 0.4 + growth30d * 0.3));

  const top10Penalty = Math.max(0, (raw.top10HoldersPct - 15) * 1.5);
  const top50Penalty = Math.max(0, (raw.top50HoldersPct - 40) * 0.5);
  const concentrationScore = Math.max(0, Math.min(100, 100 - top10Penalty - top50Penalty));

  const socialBase = Math.min(60, (Math.log10(Math.max(raw.socialVolume, 1)) / 5) * 60);
  const sentimentBonus = raw.sentimentScore * 40;
  const hypeScore = Math.max(0, Math.min(100, socialBase + sentimentBonus + 20));

  return {
    volumeScore: Math.round(volumeScore),
    holderGrowthScore: Math.round(holderGrowthScore),
    concentrationScore: Math.round(concentrationScore),
    hypeScore: Math.round(hypeScore),
  };
}

export function calculateRecommendation(metrics: Metrics): {
  totalScore: number;
  recommendation: Recommendation;
  reason: string;
} {
  const weightedScore =
    metrics.volumeScore * 0.25 +
    metrics.holderGrowthScore * 0.3 +
    metrics.concentrationScore * 0.25 +
    metrics.hypeScore * 0.2;

  const totalScore = Math.round(weightedScore);
  const { priceChange24h, priceChange7d } = metrics;
  const isPriceDown = priceChange24h < -3 || priceChange7d < -8;
  const isPriceUp = priceChange24h > 5 || priceChange7d > 12;
  const isPriceUpSharp = priceChange24h > 15 || priceChange7d > 30;
  const isHypeExtreme = metrics.hypeScore >= 85;
  const isConcentrationHigh = metrics.concentrationScore <= 35;

  let recommendation: Recommendation = "Hold";
  let reason = "Metrics are balanced. No strong signal to act.";

  if (totalScore >= 70 && isPriceDown) {
    recommendation = "Avg Down";
    reason =
      "Strong fundamentals (volume, holders, distribution) while price is weak — good entry to average down.";
  } else if (totalScore >= 70 && isPriceUp) {
    recommendation = "Avg Up";
    reason =
      "High conviction setup with rising price. Momentum + healthy metrics support averaging up.";
  } else if (totalScore <= 35 && (isPriceUpSharp || isHypeExtreme)) {
    recommendation = "Take Profit";
    reason =
      "Weak underlying metrics + sharp price rise / extreme hype. High risk of reversal — consider taking profit.";
  } else if (totalScore <= 40 && isPriceDown && isConcentrationHigh) {
    recommendation = "Cut Loss";
    reason =
      "Poor score, declining price, and high holder concentration. Risk of further dump — cut loss recommended.";
  } else if (totalScore >= 60) {
    recommendation = "Hold";
    reason = "Solid overall metrics. Continue monitoring for clearer entry/exit signals.";
  } else if (totalScore <= 45) {
    recommendation = "Hold";
    reason = "Below-average metrics. Avoid adding size until improvement is visible.";
  }

  return { totalScore, recommendation, reason };
}

export function analyzeToken(
  raw: TokenMetrics,
  priceChange24h: number,
  priceChange7d: number
) {
  const scores = computeScores(raw, priceChange24h, priceChange7d);
  const { totalScore, recommendation, reason } = calculateRecommendation({
    ...scores,
    priceChange24h,
    priceChange7d,
  });

  return {
    scores: { ...scores, totalScore },
    recommendation,
    reason,
  };
}
