import { describe, it, expect, assert } from "vitest";
import { Dec, Int, Uint } from "@keplr-wallet/unit";

import { usdcDenon } from "../model/pool-util";
import {
  calculateTVL,
  calculatePrices,
  getPrices,
  OsmosisPool,
  getPoolTvls,
} from "../service/pools";
import { DualPool, Pool } from "../model/pools.types";
import { LCDClient } from "../external/cosmos-client/lcd-client";

const toUUnit = (amount: number) =>
  new Int(amount).mul(new Int(10).pow(new Uint(6))).toString();

const atomOsmo: Partial<DualPool> = {
  "@type": "/osmosis.gamm.v1beta1.Pool",
  pool_assets: [
    {
      token: {
        denom: "uatom",
        amount: toUUnit(1000),
      },
      weight: "0.1",
    },
    {
      token: {
        denom: "uosmo",
        amount: toUUnit(4000),
      },
      weight: "0.1",
    },
  ],
};

const atomUSDC: Partial<Pool> = {
  "@type": "/osmosis.gamm.v1beta1.Pool",
  pool_assets: [
    {
      token: {
        denom: "uosmo",
        amount: toUUnit(400),
      },
      weight: "0.1",
    },
    {
      token: {
        denom: usdcDenon,
        amount: toUUnit(1000),
      },
      weight: "0.1",
    },
  ],
};

describe.concurrent("osmosis", () => {
  it(
    "getPoolTvls",
    async () => {
      const res = (await getPoolTvls(LCDClient.create())) as [OsmosisPool];

      // when writing the test tvl was 75 MIO
      const atomOsmo = res[0].liquidityUsd;
      assert(atomOsmo);
      expect(parseInt(atomOsmo!)).toBeGreaterThan(20 * 10 ** 6);
      expect(parseInt(atomOsmo!)).toBeLessThan(100 * 10 ** 6);
    },
    { timeout: 30 * 1000 }
  );

  it("getPools - unit", () => {
    const withTvl = calculateTVL([atomOsmo as Pool, atomUSDC as Pool]);
    const [p1, p2] = withTvl as [OsmosisPool, OsmosisPool];
    expect(p2.liquidityUsd).toEqual(new Dec("2000").toString());
    expect(p1.liquidityUsd).toEqual(new Dec("20000").toString());
  });

  it(
    "getPrices",
    async () => {
      const stars =
        "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4";

      const res = await getPrices(LCDClient.create());
      expect(res).toHaveProperty(stars);
      expect(res[stars]).toBeTruthy();
    },
    { timeout: 30 * 1000 }
  );

  it("calculate Prices", () => {
    const prices = calculatePrices([atomOsmo as Pool, atomUSDC as Pool]);

    const atomPriceRaw = prices["uatom"];
    assert(atomPriceRaw);

    const atom = new Dec(atomPriceRaw);
    expect(atom.equals(new Dec("10"))).toBeTruthy();

    const osmoPriceRaw = prices["uosmo"];
    assert(osmoPriceRaw);
    const osmo = new Dec(osmoPriceRaw);
    expect(osmo.equals(new Dec("2.5"))).toBeTruthy();

    const usdcPriceRaw = prices[usdcDenon];
    assert(usdcPriceRaw);
    const usdc = new Dec(usdcPriceRaw);
    expect(usdc.equals(new Dec("1"))).toBeTruthy();
  });
});
