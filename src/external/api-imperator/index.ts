import { Api as OsmosisApi } from './imperator-osmosis'
export { PoolDataSchema, AprReponseSchema, PoolAprSchema } from './imperator-osmosis-schema'
export type { PoolApr } from './imperator-osmosis-schema'

export const osmosisApi = new OsmosisApi({ baseUrl: 'https://api-osmosis.imperator.co' })
