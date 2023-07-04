import { LCDClient } from "../external/cosmos-client/lcd-client";
import type { Pool, PoolResponse } from "../model/pools.types";

export async function fetchAllPools(client: LCDClient) {
  const url = `/osmosis/gamm/v1beta1/pools`;
  const search = new URLSearchParams({
    "pagination.limit": "2000",
  });
  const fullUrl = `${url}?${search.toString()}`;
  const raw = await client.fetch(fullUrl);
  return raw as PoolResponse;
}

export async function fetchPool(client: LCDClient, poolId: number) {
  const raw = await client.fetch(`/osmosis/gamm/v1beta1/pools/${poolId}`);
  const res = raw as { pool: Pool };
  return res;
}
