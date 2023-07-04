export interface PoolResponse {
    pools: Array<Pool | StableSwapPool>
    pagination: Pagination
}

interface BasePool {
    '@type': string
    id: string // number
    pool_params: PoolParams
    future_pool_governor: '24h'
    total_shares: Token
}

export interface DualPool extends BasePool {
    '@type': '/osmosis.gamm.v1beta1.Pool'
    adress: string
    total_weight: string //number
    pool_assets: [PoolAsset, PoolAsset]
}

export type Pool = DualPool | StableSwapPool | DualStableSwapPool

export function isDualPool(pool: Pool): pool is DualPool {
    /**
     * Some pools are consisting of 2 pool shares + something else (poolId:55)
     */
    return pool['@type'] === '/osmosis.gamm.v1beta1.Pool' && pool.pool_assets.length === 2
}

export function isDualStablePool(pool: Pool): pool is DualStableSwapPool {
    return (
        pool['@type'] === '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool' &&
        pool.pool_liquidity.length === 2
    )
}

export interface StableSwapPool extends BasePool {
    '@type': '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool'
    pool_liquidity: Token[]
    scaling_factors: string[]
    scaling_factor_controller: string
}

export interface DualStableSwapPool extends StableSwapPool {
    pool_liquidity: [Token, Token]
}

interface Token {
    denom: string
    amount: string //number
}

interface PoolAsset {
    token: Token
    weight: string //number
}

interface PoolParams {
    swap_fee: string //number
    exit_fee: string //number
    smooth_weight_change_params: unknown
}

interface Pagination {
    next_key: string
    total: string //number
}
