import { Coin, Int } from "@keplr-wallet/unit";

import { toUSD } from "../model/pool-util";
import { fetchAllPools } from "../infrastructure/pools-api";
import {
  isDualPool,
  isDualStablePool,
  Pool,
  StableSwapPool,
} from "../model/pools.types";
import { calculateRouteGraph, getUSDCPrice } from "../model/route";
import { PoolGraph } from "../model/graph";
import { LCDClient } from "../external/cosmos-client/lcd-client";

let tracePool = 749;

export async function getPoolTvls(osmosisClient: LCDClient) {
  const { pools } = await fetchAllPools(osmosisClient);
  const withTvl = calculateTVL(pools);
  return withTvl;
}
export async function getPrices(osmosisClient: LCDClient) {
  const { pools } = await fetchAllPools(osmosisClient);
  const prices = calculatePrices(pools);
  return prices;
}

export type OsmosisPool = Pool & {
  liquidityUsd: string | null;
};

export function calculatePrices(
  pools: Array<Pool | StableSwapPool>
): Record<string, string | undefined> {
  const allDenoms = Array.from(
    new Set([
      ...pools
        .filter(isDualPool)
        .flatMap((pool) => [
          pool.pool_assets[0].token.denom,
          pool.pool_assets[1].token.denom,
        ]),
      ...pools
        .filter(isDualStablePool)
        .flatMap((pool) => [
          pool.pool_liquidity[0].denom,
          pool.pool_liquidity[1].denom,
        ]),
    ])
  );

  const graph = calculateRouteGraph(pools);

  return Object.fromEntries(
    allDenoms.map((denom) => {
      const price = getUSDCPrice(graph, denom);
      if (price) {
        return [denom, toUSD(price)];
      }
      return [denom, undefined];
    })
  );
}

export function calculateTVL(pools: Array<Pool | StableSwapPool>) {
  const graph = new PoolGraph(pools);

  const withTvl = pools.map((pool) => {
    const tvl = graph.getTvl(pool);
    return {
      ...pool,
      liquidityUsd: tvl,
    };
  });
  return withTvl;
}
