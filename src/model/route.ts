import { Int, Coin } from '@keplr-wallet/unit'
import ok from 'tiny-invariant'

import { base, getIndex, hasUnevenWeight, osmoDenon, usdcDenon } from './pool-util'
import { DualPool, isDualPool, isDualStablePool, Pool, StableSwapPool } from './pools.types'

export type RouteGraph = Map<string, Map<string, DualPool | StableSwapPool>>

const traceDenom: string | undefined =
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'

type Route = {
    denomIn: string
    denomOut: string
    pools: Array<DualPool | StableSwapPool>
    route: string[]
}

export function getUSDCPrice(graph: RouteGraph, denomIn: string) {
    const trace = denomIn === traceDenom
    if (denomIn === usdcDenon) {
        trace && console.log('denomIn === usdc')
        return new Coin(usdcDenon, base)
    }

    const route = getRoute(graph, { denomIn, denomOut: usdcDenon })

    if (route) {
        trace && console.log('Route', route)
        const amount = calculateRouteAmount(route)
        return amount
    } else {
        trace && console.log('No Route')
    }
}

export function getRoute(
    graph: RouteGraph,
    {
        denomIn,
        denomOut,
    }: {
        denomIn: string
        denomOut: string
    }
): Route | null {
    const directPool = graph.get(denomIn)?.get(denomOut)
    if (directPool) {
        return {
            denomIn,
            denomOut,
            pools: [directPool],
            route: [denomIn, denomOut],
        }
    }

    const inToOsmo = graph.get(denomIn)?.get(osmoDenon)
    const osmoToOut = graph.get(denomOut)?.get(osmoDenon)
    if (inToOsmo && osmoToOut) {
        return {
            denomIn,
            denomOut,
            pools: [inToOsmo, osmoToOut],
            route: [denomIn, osmoDenon, denomOut],
        }
    }

    return null
}

export function calculateRouteAmount(route: Route, amountIn?: Int) {
    const initialAmount = amountIn ?? new Int(10 ** 6)
    const coinIn = new Coin(route.denomIn, initialAmount)
    if (route.pools.length === 1 && isDualPool(route.pools[0]!)) {
        const [directPool] = route.pools
        return swapDualPool(directPool, coinIn)
    }

    return route.pools.reduce((coin, pool) => {
        if (isDualPool(pool)) {
            return swapDualPool(pool, coin)
        }
        return swapStableDualPool(pool, coin)
    }, coinIn)
}

export function calculateRouteGraph(pools: Pool[]) {
    const routeGraph = new Map<string, Map<string, DualPool | StableSwapPool>>()
    for (const pool of pools) {
        const token1 = isDualPool(pool)
            ? pool.pool_assets[0].token.denom
            : isDualStablePool(pool)
            ? pool.pool_liquidity[0].denom
            : undefined
        const token2 = isDualPool(pool)
            ? pool.pool_assets[1].token.denom
            : isDualStablePool(pool)
            ? pool.pool_liquidity[1].denom
            : undefined

        if (!token1 || !token2) {
            continue
        }
        if (!routeGraph.has(token1)) {
            routeGraph.set(token1, new Map())
        }
        if (!routeGraph.get(token1)!.has(token2)) {
            routeGraph.get(token1)!.set(token2, pool)
        }

        if (!routeGraph.has(token2)) {
            routeGraph.set(token2, new Map())
        }
        if (!routeGraph.get(token2)!.has(token1)) {
            routeGraph.get(token2)!.set(token1, pool)
        }
    }
    return routeGraph
}

function swapDualPool(pool: DualPool, coin: Coin): Coin {
    ok(isDualPool(pool), 'not a dual pool')
    const inIndex = getIndex(pool, coin.denom)
    if (inIndex < 0) throw new Error('Invalid denom')
    const outIndex = 1 - inIndex
    const inToken = pool.pool_assets[inIndex]?.token
    const outToken = pool.pool_assets[outIndex]?.token
    ok(inToken, 'Invalid inToken')
    ok(outToken, 'Invalid outToken')
    const inAmount = new Int(inToken.amount)
    const outAmount = new Int(outToken.amount)
    const finalAmount = coin.amount.toDec().mul(outAmount.toDec()).quo(inAmount.toDec()).truncate()
    return new Coin(outToken.denom, finalAmount)
}

function swapStableDualPool(pool: StableSwapPool, coin: Coin): Coin {
    ok(isDualStablePool(pool), `Not a dual stable swap`)
    const inIndex = getIndex(pool, coin.denom)
    if (inIndex < 0) throw new Error('Invalid denom')
    const outIndex = 1 - inIndex
    const inToken = pool.pool_liquidity[inIndex]
    const outToken = pool.pool_liquidity[outIndex]
    ok(inToken, 'Invalid inToken')
    ok(outToken, 'Invalid outToken')
    const inRaw = pool.scaling_factors[inIndex]
    const outRaw = pool.scaling_factors[outIndex]
    ok(inRaw, 'Invalid inRaw')
    ok(outRaw, 'Invalid outRaw')
    const inAmount = new Int(inRaw)
    const outAmount = new Int(outRaw)
    const finalAmount = coin.amount.toDec().mul(outAmount.toDec()).quo(inAmount.toDec()).truncate()
    return new Coin(outToken.denom, finalAmount)
}
