import { Coin, Int, Uint } from '@keplr-wallet/unit'

import { DualPool, isDualPool, StableSwapPool } from './pools.types'

export const usdcDenon = 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'
export const osmoDenon = 'uosmo'

export const base = new Int(10).pow(new Uint(6))

export function toUSD(coin: Coin) {
    if (coin.denom !== usdcDenon) {
        throw new Error('Not USDC')
    }
    return coin.amount.toDec().quo(base.toDec()).toString()
}

type Modifier = (amount: Int) => Int
export function modifyCoin(coin: Coin, ...modifiers: Modifier[]) {
    return modifiers.reduce((c, modify) => {
        const newAmount = modify(c.amount)
        return new Coin(coin.denom, newAmount)
    }, coin)
}

export function getIndex(pool: DualPool | StableSwapPool, denom: string) {
    if (isDualPool(pool)) {
        const dualIndex = pool.pool_assets.findIndex((t) => t.token.denom === denom)
        return dualIndex
    }
    const stableIndex = pool.pool_liquidity.findIndex((t) => t.denom === denom)
    return stableIndex
}

export function getUsdcIndex(pool: DualPool | StableSwapPool) {
    return getIndex(pool, usdcDenon)
}
export function hasUnevenWeight(pool: DualPool) {
    return pool.pool_assets[0].weight !== pool.pool_assets[1].weight
}
