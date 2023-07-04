import { osmosisApi } from "../src/external/api-imperator";

import { getPoolTvls } from "../src/service/pools";
import { Pool, StableSwapPool } from "../src/model/pools.types";
import { LCDClient } from "../src/external/cosmos-client/lcd-client";

main();
async function main() {
  const osmosis = LCDClient.create();
  const tvls = await getPoolTvls(osmosis);

  //   logPools(tvls, ["709", "749"]);
  //   return;

  console.log("Amount of Pools", tvls.length);

  const withTvl = tvls
    .filter((p) => p.liquidityUsd && parseFloat(p.liquidityUsd) > 0)
    .sort((a, b) => {
      return parseFloat(a.liquidityUsd!) - parseFloat(b.liquidityUsd!);
    })
    .reverse();
  console.log("With TVL", withTvl.length);
  withTvl
    .slice(0, 20)
    .forEach((a) => console.log(a.id, parseInt(a.liquidityUsd!)));

  //   return;

  const first10 = withTvl.slice(0, 1);
  // console.log('First 10', first10)

  const first = withTvl.filter((a) => a.id === "2");

  await Promise.all(
    first.map(async (pool) => {
      console.log("PoolId", pool.id);
      const impPoolResponse = await osmosisApi.pools.poolById(
        parseInt(pool.id)
      );
      console.log("Status", impPoolResponse.status);
      const impPool = impPoolResponse.data;
      const [f] = impPool;
      const myLiq = parseFloat(pool.liquidityUsd!);
      const impLiq = f.liquidity;
      const diff = myLiq - impLiq;
      console.log(myLiq);
      console.log(impLiq);
      console.log("Diff %", Math.abs(diff / myLiq) * 100);
      // console.log(impPool)
      // console.log(pool)
    })
  );
}

function logPools(pools: Array<Pool | StableSwapPool>, poolIds: string[]) {
  pools.forEach((pool) => {
    if (!poolIds.includes(pool.id)) return;
    console.log(JSON.stringify(pool, null, 4));
  });
}
