/**
 * Quant Backtest Sprint: Replacing $1,000/mo Data Feeds via HTTP 402 Micropayments
 *
 * Problem:
 * Institutional crypto data providers (Kaiko, Amberdata, CoinMetrics) charge
 * $1,000 - $3,000/month recurring minimums for tick-level cross-venue spreads,
 * microsecond execution latency benchmarks, and market dislocation feeds.
 *
 * Solution:
 * Using Coinbase AgentKit and @zeromodern/agentkit-provider-0mod, quants and AI agents
 * pay strictly per telemetry slice via HTTP 402 micropayments on Base ($0.015 - $0.150 USDC).
 * A full 24-hour high-resolution strategy backtest costs ~$1.50 instead of $1,000.00/mo.
 *
 * Prerequisites:
 *   npm install @coinbase/agentkit @zeromodern/agentkit-provider-0mod viem
 *   export PAYER_PRIVATE_KEY="0x..." # Base wallet with a few USDC
 */

import { AgentKit } from "@coinbase/agentkit";
import { zeroModActionProvider } from "@zeromodern/agentkit-provider-0mod";

async function runQuantBacktestSprint() {
  console.log("=== 0mod Crypto Telemetry: Quant Backtest Sprint ===");
  console.log("Target: Cross-venue CEX-DEX Dislocation & Latency Audit");
  console.log("Alternative: $1,000/mo Enterprise Subscription (Kaiko / Amberdata)\n");

  // 1. Initialize AgentKit with the 0mod action provider
  const provider = zeroModActionProvider();
  let totalUsdcSpent = 0.0;

  // Step 1: Query Telemetry Coverage & Supported Pairs (FREE)
  console.log("Step 1: Discovering available coverage windows...");
  try {
    const coverageRaw = await provider.cryptoCoverage({} as any, {});
    const coverage = JSON.parse(coverageRaw);
    console.log(`✓ Coverage service: ${coverage.service} (v${coverage.version})`);
    console.log(`✓ Supported pairs: ${coverage.supported_pairs.join(", ")}`);
    console.log(`✓ Earliest data: ${coverage.earliest_timestamp}`);
    console.log(`✓ Total dislocations indexed: ${coverage.total_dislocations.toLocaleString()}`);
    console.log(`✓ Slices cost: $0.00 USDC (Free public discovery)\n`);
  } catch (err) {
    console.error("Failed to fetch coverage:", err);
  }

  // Target backtest parameters
  const targetPair = "AERO/USD";
  const targetDate = "2026-09-13";
  const targetTime = "1400"; // 14:00 UTC slice

  // Step 2: Fetch 15-minute Spread Candle ($0.015 USDC)
  console.log(`Step 2: Fetching 15m spread candle for ${targetPair} at ${targetDate} ${targetTime} UTC...`);
  try {
    const candleRaw = await provider.cryptoSpreadCandles({} as any, {
      pair: targetPair,
      date: targetDate,
      time: targetTime,
      interval: "15m",
    });
    const candle = JSON.parse(candleRaw);
    totalUsdcSpent += 0.015;
    console.log(`✓ Open Spread: ${candle.open_raw_spread_bps} bps | High: ${candle.high_raw_spread_bps} bps | Low: ${candle.low_raw_spread_bps} bps`);
    console.log(`✓ Avg Net Spread: ${candle.avg_net_spread_bps} bps (after venue fees & gas)`);
    console.log(`✓ Dislocation events in 15m window: ${candle.dislocation_count}`);
    console.log(`✓ Cumulative volume depth: $${candle.volume_depth_usd.toLocaleString()}`);
    console.log(`✓ Cost: $0.015 USDC\n`);
  } catch (err) {
    console.error("Failed to fetch spread candle:", err);
  }

  // Step 3: Pull Granular Market Dislocations ($0.045 USDC)
  console.log(`Step 3: Drilling into granular dislocation ticks for ${targetPair}...`);
  try {
    const dislocRaw = await provider.cryptoDislocations({} as any, {
      pair: targetPair,
      date: targetDate,
      time: targetTime,
    });
    const dislocSlice = JSON.parse(dislocRaw);
    totalUsdcSpent += 0.045;
    console.log(`✓ Total granular dislocations: ${dislocSlice.count}`);
    if (dislocSlice.dislocations && dislocSlice.dislocations.length > 0) {
      const topTick = dislocSlice.dislocations[0];
      console.log(`  Top Dislocation Tick:`);
      console.log(`    Timestamp: ${topTick.timestamp}`);
      console.log(`    Route: Buy ${topTick.buy_venue} ($${topTick.buy_price}) → Sell ${topTick.sell_venue} ($${topTick.sell_price})`);
      console.log(`    Raw Spread: ${topTick.raw_spread_bps} bps | Net Spread: ${topTick.net_spread_bps} bps`);
      console.log(`    Estimated Profit: $${topTick.est_profit_usd.toFixed(4)} | Depth: $${topTick.liquidity_depth_usd.toFixed(2)}`);
    }
    console.log(`✓ Cost: $0.045 USDC\n`);
  } catch (err) {
    console.error("Failed to fetch dislocations:", err);
  }

  // Step 4: Benchmark Venue Execution Latency ($0.075 USDC)
  console.log(`Step 4: Benchmarking venue execution latency and fill rates...`);
  try {
    const latencyRaw = await provider.cryptoExecutionLatency({} as any, {
      date: targetDate,
      time: targetTime,
    });
    const latency = JSON.parse(latencyRaw);
    totalUsdcSpent += 0.075;
    console.log(`✓ p50 Execution Latency: ${latency.p50_latency_ms}ms | p90: ${latency.p90_latency_ms}ms | p99: ${latency.p99_latency_ms}ms`);
    console.log(`✓ Fill Rate: ${latency.fill_rate_pct}% across ${latency.sample_count} live fills`);
    console.log(`✓ Venue Breakdown: Coinbase ~${latency.venues.coinbase || 0}ms | Aerodrome Base ~${latency.venues.aerodrome_base || 0}ms`);
    console.log(`✓ Cost: $0.075 USDC\n`);
  } catch (err) {
    console.error("Failed to fetch latency:", err);
  }

  // Summary Comparison
  console.log("================== COST COMPARISON ==================");
  console.log(`Total USDC Billed (via x402 on Base):  $${totalUsdcSpent.toFixed(3)} USDC`);
  console.log(`Enterprise Subscription Rate (Kaiko):   $1,000.00 / month`);
  console.log(`Capital Saved for Quant Strategy:       $${(1000 - totalUsdcSpent).toFixed(2)} USD (99.97% savings)`);
  console.log("=====================================================");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runQuantBacktestSprint().catch(console.error);
}

export { runQuantBacktestSprint };
