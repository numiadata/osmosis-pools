import { describe, it, expect, assert } from 'vitest'
import { PoolGraph } from '../graph'

describe('Graph', () => {
    it('Pool 749', () => {
        const { pools } = require('./fixtures/graph-1.json')
        const graph = new PoolGraph(pools)

        // ATOM/USDC
        const first = pools[0]
        const tvl1 = graph.getTvl(first)
        expect(tvl1).toBeCloseTo(103.66, 1)

        const second = pools[1]
        const tvl2 = graph.getTvl(second)
        console.log(second.id, tvl2)
    })
})
