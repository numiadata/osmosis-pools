import { Int, Coin } from '@keplr-wallet/unit'
import ok from 'tiny-invariant'
import { RouteGraph, calculateRouteGraph, getUSDCPrice } from './route'
import { Pool, StableSwapPool, isDualPool, isDualStablePool } from './pools.types'
import { getUsdcIndex, hasUnevenWeight, modifyCoin, toUSD, usdcDenon, base } from './pool-util'

const tracePool: string | undefined = '749'

export class PoolGraph {
    graph: RouteGraph
    prices = new Map<string, Coin>()
    liquidities = new Map<string, string>()
    constructor(pools: Array<Pool | StableSwapPool>) {
        this.graph = calculateRouteGraph(pools)
    }

    getTvl(pool: Pool) {
        if (this.liquidities.has(pool.id)) {
            return this.liquidities.get(pool.id)
        }
        const trace = pool.id === tracePool
        if (!isDualPool(pool) && !isDualStablePool(pool)) {
            trace && console.log('not dual pool', (pool as any).id)
            return null
        }
        if (isDualPool(pool) && hasUnevenWeight(pool)) {
            /**
             * Tried to analyze these, but the pools with uneven weights were not on the
             * Osmosis Zone Analytics dashboard (https://info.osmosis.zone/pools) to verify TVL
             */
            trace && console.log('pool has uneven weights', pool.id)
            return null
        }
        const token = isDualPool(pool)
            ? pool.pool_assets[getUsdcIndex(pool)]?.token
            : pool.pool_liquidity[getUsdcIndex(pool)]
        if (token) {
            trace && console.log('token', token)
            const amount = new Int(token.amount)
            const coin = new Coin(usdcDenon, amount)
            const r = toUSD(modifyCoin(coin, double))
            this.liquidities.set(pool.id, r)
            return r
        }
        const token1 = isDualPool(pool) ? pool.pool_assets[0].token : pool.pool_liquidity[0]
        const token2 = isDualPool(pool) ? pool.pool_assets[1].token : pool.pool_liquidity[1]
        const amount1 = token1.amount
        const amount2 = token2.amount
        if (this.prices.has(token1.denom)) {
            trace && console.log('PriceCache has 1', token1.denom, this.prices.get(token1.denom))
            const r = toUSD(
                modifyCoin(this.prices.get(token1.denom)!, double, (amount) =>
                    amount.mul(getTokenPoolAmount(amount1))
                )
            )
            this.liquidities.set(pool.id, r)
            return r
        } else if (this.prices.has(token2.denom)) {
            trace && console.log('PriceCache has 2', token2.denom, this.prices.get(token2.denom))
            const r = toUSD(
                modifyCoin(this.prices.get(token2.denom)!, double, (amount) =>
                    amount.mul(getTokenPoolAmount(amount2))
                )
            )
            this.liquidities.set(pool.id, r)
            return r
        }

        const usdcPrice2 = getUSDCPrice(this.graph, token2.denom)
        if (usdcPrice2) {
            trace && console.log('usdcPrice2', usdcPrice2)
            this.prices.set(token2.denom, usdcPrice2)
            const asUSDC = toUSD(
                modifyCoin(usdcPrice2, double, (amount) => amount.mul(getTokenPoolAmount(amount2)))
            )
            this.liquidities.set(pool.id, asUSDC)
            return asUSDC
        }

        const usdcPrice1 = getUSDCPrice(this.graph, token1.denom)
        if (usdcPrice1) {
            trace && console.log('usdcPrice2', usdcPrice1)
            this.prices.set(token1.denom, usdcPrice1)
            const asUSDC = toUSD(
                modifyCoin(usdcPrice1, double, (amount) => amount.mul(getTokenPoolAmount(amount1)))
            )
            this.liquidities.set(pool.id, asUSDC)
            return asUSDC
        }

        return null
    }
}

function getTokenPoolAmount(amount: string) {
    return new Int(amount).toDec().quo(base.toDec()).round()
}

function double(amount: Int) {
    return amount.mul(new Int(2))
}
