import { bench } from 'vitest'

import { calculatePrices, calculateTVL } from '../service/pools'
import { Pool } from '../model/pools.types'
import pools from '../__tests__/data/pools.json'

bench(
    'Prices',
    () => {
        calculatePrices(pools as unknown as Pool[])
    },
    { iterations: 100 }
)

bench(
    'TVL',
    () => {
        calculateTVL(pools as unknown as Pool[])
    },
    { iterations: 100 }
)
