import { z } from 'zod'

const PoolInfoSchema = z
    .object({
        symbol: z.string(),
        amount: z.number(),
        denom: z.string(),
        coingecko_id: z.string(),
        liquidity: z.number(),
        liquidity_24h_change: z.number(),
        price: z.number(),
        price_24h_change: z.number(),
        fees: z.string(),
    })
    .passthrough()
export const PoolDataSchema = z.tuple([PoolInfoSchema, PoolInfoSchema])

const AprSchema = z.object({
    start_date: z.string(),
    denom: z.string(),
    symbol: z.string(),
    apr_1d: z.number(),
    apr_7d: z.number(),
    apr_14d: z.number(),
    apr_superfluid: z.number().nullable(),
})

export const PoolAprSchema = z.object({
    pool_id: z.number(),
    apr_list: z.array(AprSchema),
})
export type PoolApr = z.infer<typeof PoolAprSchema>

export const AprReponseSchema = z.array(PoolAprSchema)
