/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Body_token_tradingview_v1_authorize_post */
export interface BodyTokenTradingviewV1AuthorizePost {
    /** Login */
    login: string
    /** Password */
    password: string
    /**
     * Scope
     * @default ""
     */
    scope?: string
}

/** HTTPValidationError */
export interface HTTPValidationError {
    /** Detail */
    detail?: ValidationError[]
}

/** ValidationError */
export interface ValidationError {
    /** Location */
    loc: string[]
    /** Message */
    msg: string
    /** Error Type */
    type: string
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean
    /** request path */
    path: string
    /** content type of request body */
    type?: ContentType
    /** query params */
    query?: QueryParamsType
    /** format of response (i.e. response.json() -> format: "json") */
    format?: ResponseFormat
    /** request body */
    body?: unknown
    /** base url */
    baseUrl?: string
    /** request cancellation token */
    cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
    baseUrl?: string
    baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
    securityWorker?: (
        securityData: SecurityDataType | null
    ) => Promise<RequestParams | void> | RequestParams | void
    customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
    data: D
    error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
    Json = 'application/json',
    FormData = 'multipart/form-data',
    UrlEncoded = 'application/x-www-form-urlencoded',
    Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
    public baseUrl: string = ''
    private securityData: SecurityDataType | null = null
    private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
    private abortControllers = new Map<CancelToken, AbortController>()
    private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

    private baseApiParams: RequestParams = {
        headers: {},
        redirect: 'follow',
    }

    constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
        Object.assign(this, apiConfig)
    }

    public setSecurityData = (data: SecurityDataType | null) => {
        this.securityData = data
    }

    protected encodeQueryParam(key: string, value: any) {
        const encodedKey = encodeURIComponent(key)
        return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
    }

    protected addQueryParam(query: QueryParamsType, key: string) {
        return this.encodeQueryParam(key, query[key])
    }

    protected addArrayQueryParam(query: QueryParamsType, key: string) {
        const value = query[key]
        return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
    }

    protected toQueryString(rawQuery?: QueryParamsType): string {
        const query = rawQuery || {}
        const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
        return keys
            .map((key) =>
                Array.isArray(query[key])
                    ? this.addArrayQueryParam(query, key)
                    : this.addQueryParam(query, key)
            )
            .join('&')
    }

    protected addQueryParams(rawQuery?: QueryParamsType): string {
        const queryString = this.toQueryString(rawQuery)
        return queryString ? `?${queryString}` : ''
    }

    private contentFormatters: Record<ContentType, (input: any) => any> = {
        [ContentType.Json]: (input: any) =>
            input !== null && (typeof input === 'object' || typeof input === 'string')
                ? JSON.stringify(input)
                : input,
        [ContentType.Text]: (input: any) =>
            input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
        [ContentType.FormData]: (input: any) =>
            Object.keys(input || {}).reduce((formData, key) => {
                const property = input[key]
                formData.append(
                    key,
                    property instanceof Blob
                        ? property
                        : typeof property === 'object' && property !== null
                        ? JSON.stringify(property)
                        : `${property}`
                )
                return formData
            }, new FormData()),
        [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
    }

    protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        }
    }

    protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken)
            if (abortController) {
                return abortController.signal
            }
            return void 0
        }

        const abortController = new AbortController()
        this.abortControllers.set(cancelToken, abortController)
        return abortController.signal
    }

    public abortRequest = (cancelToken: CancelToken) => {
        const abortController = this.abortControllers.get(cancelToken)

        if (abortController) {
            abortController.abort()
            this.abortControllers.delete(cancelToken)
        }
    }

    public request = async <T = any, E = any>({
        body,
        secure,
        path,
        type,
        query,
        format,
        baseUrl,
        cancelToken,
        ...params
    }: FullRequestParams): Promise<HttpResponse<T, E>> => {
        const secureParams =
            ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
                this.securityWorker &&
                (await this.securityWorker(this.securityData))) ||
            {}
        const requestParams = this.mergeRequestParams(params, secureParams)
        const queryString = query && this.toQueryString(query)
        const payloadFormatter = this.contentFormatters[type || ContentType.Json]
        const responseFormat = format || requestParams.format

        return this.customFetch(
            `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
            {
                ...requestParams,
                headers: {
                    ...(requestParams.headers || {}),
                    ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
                },
                signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
                body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
            }
        ).then(async (response) => {
            const r = response as HttpResponse<T, E>
            r.data = null as unknown as T
            r.error = null as unknown as E

            const data = !responseFormat
                ? r
                : await response[responseFormat]()
                      .then((data) => {
                          if (r.ok) {
                              r.data = data
                          } else {
                              r.error = data
                          }
                          return r
                      })
                      .catch((e) => {
                          r.error = e
                          return r
                      })

            if (cancelToken) {
                this.abortControllers.delete(cancelToken)
            }

            if (!response.ok) throw data
            return data
        })
    }
}

/**
 * @title Production - Osmosis Historical Data
 * @version 1.1.1
 *
 * REST API to get the historical data for Osmosis
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    health = {
        /**
         * No description
         *
         * @tags health
         * @name CheckHealth
         * @summary Check Health
         * @request GET:/health/v1/check
         */
        checkHealth: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/health/v1/check`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    overview = {
        /**
         * No description
         *
         * @tags overview
         * @name Metrics
         * @summary Metrics
         * @request GET:/overview/v1/metrics
         */
        metrics: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/overview/v1/metrics`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags overview
         * @name Message
         * @summary Message
         * @request GET:/overview/v1/message
         */
        message: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/overview/v1/message`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    ibc = {
        /**
         * @description List all existing paths that have been manually set up on the config
         *
         * @tags ibc
         * @name IbcInfo
         * @summary Ibc Info
         * @request GET:/ibc/v1/info
         */
        ibcInfo: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/ibc/v1/info`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description List all existing paths with pending packets, last tx and since when (in minutes) optionnal: filter by dex
         *
         * @tags ibc
         * @name IbcAll
         * @summary Ibc All
         * @request GET:/ibc/v1/all
         */
        ibcAll: (
            query?: {
                /** Dex */
                dex?: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/ibc/v1/all`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * @description List chosen source and destination paths with pending packets, last tx and since when (in minutes) strictly superior to trigger option
         *
         * @tags ibc
         * @name IbcSourceDestination
         * @summary Ibc Source Destination
         * @request GET:/ibc/v1/source/{source}/destination{destination}
         */
        ibcSourceDestination: (
            source: string,
            destination: string,
            query: {
                /** Minutes Trigger */
                minutes_trigger: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/ibc/v1/source/${source}/destination${destination}`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * @description List chosen source paths with pending packets, last tx and since when (in minutes) strictly superior to trigger option
         *
         * @tags ibc
         * @name IbcSource
         * @summary Ibc Source
         * @request GET:/ibc/v1/source/{source}
         */
        ibcSource: (
            source: string,
            query: {
                /** Minutes Trigger */
                minutes_trigger: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/ibc/v1/source/${source}`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags ibc
         * @name IbcDestination
         * @summary Ibc Destination
         * @request GET:/ibc/v1/destination/{destination}
         */
        ibcDestination: (
            destination: string,
            query: {
                /** Minutes Trigger */
                minutes_trigger: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/ibc/v1/destination/${destination}`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags ibc
         * @name IbcRaw
         * @summary Ibc Raw
         * @request GET:/ibc/v1/raw
         */
        ibcRaw: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/ibc/v1/raw`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    pairs = {
        /**
         * No description
         *
         * @tags pairs
         * @name PairsSummary
         * @summary Pairs Summary
         * @request GET:/pairs/v1/summary
         */
        pairsSummary: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/pairs/v1/summary`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description - **pool_id**: ID of pool to return - **asset_in**: First name asset of PAIR (ex for ATOM/USDT, asset_out=ATOM (symbol) or asset_out=ibc/1XX (denom)) - **asset_out**: Second name asset of PAIR (ex for ATOM/USDT, asset_out=USDT (symbol) or asset_out=ibc/2XX (denom)) - **range**: Range of historical Data (Available values : 7d, 1mo, 1y, all) - **asset_type**: Type of asset in asset_in and asset_out (Available values : symbol, denom)
         *
         * @tags pairs
         * @name PairsHistoricalChart
         * @summary Pairs Historical Chart
         * @request GET:/pairs/v1/historical/{pool_id}/chart
         */
        pairsHistoricalChart: (
            poolId: number,
            query: {
                /** Asset In */
                asset_in: string
                /** Asset Out */
                asset_out: string
                /** Range */
                range: string
                /** Asset Type */
                asset_type: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/pairs/v1/historical/${poolId}/chart`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),
    }
    pools = {
        /**
         * No description
         *
         * @tags pools
         * @name PoolsAll
         * @summary Pools All
         * @request GET:/pools/v2/all
         */
        poolsAll: (
            query: {
                /** Low Liquidity */
                low_liquidity: boolean
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/pools/v2/all`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * @description - **pool_id**: ID of pool to return
         *
         * @tags pools
         * @name PoolById
         * @summary Pool By Id
         * @request GET:/pools/v2/{pool_id}
         */
        poolById: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/pools/v2/${poolId}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags pools
         * @name LiquidityByPools
         * @summary Liquidity By Pools
         * @request GET:/pools/v2/liquidity/{pool_id}/chart
         */
        liquidityByPools: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/pools/v2/liquidity/${poolId}/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags pools
         * @name VolumeByPools
         * @summary Volume By Pools
         * @request GET:/pools/v2/volume/{pool_id}/chart
         */
        volumeByPools: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/pools/v2/volume/${poolId}/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    tokens = {
        /**
         * No description
         *
         * @tags tokens
         * @name TokensAll
         * @summary Tokens All
         * @request GET:/tokens/v2/all
         */
        tokensAll: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tokens/v2/all`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name TokensMcap
         * @summary Tokens Mcap
         * @request GET:/tokens/v2/mcap
         */
        tokensMcap: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tokens/v2/mcap`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name TokensBySymbol
         * @summary Tokens By Symbol
         * @request GET:/tokens/v2/{symbol}
         */
        tokensBySymbol: (symbol: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/${symbol}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description - **symbol**: Symbol of token to return - **range**: Range of historical Data (Available values : 5,15,30,60,120,240,720,1440,10080,43800)
         *
         * @tags tokens
         * @name TokenPriceHistoricalChartV2
         * @summary Token Price Historical Chart V2
         * @request GET:/tokens/v2/historical/{symbol}/chart
         */
        tokenPriceHistoricalChartV2: (
            symbol: string,
            query: {
                /** Tf */
                tf: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/historical/${symbol}/chart`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name LiquidityByTokensV2
         * @summary Liquidity By Tokens V2
         * @request GET:/tokens/v2/liquidity/{symbol}/chart
         */
        liquidityByTokensV2: (symbol: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/liquidity/${symbol}/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name VolumeByTokens
         * @summary Volume By Tokens
         * @request GET:/tokens/v2/volume/{symbol}/chart
         */
        volumeByTokens: (symbol: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/volume/${symbol}/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description Available tokens are: - ** SYMBOL : https://info.osmosis.zone/tokens**
         *
         * @tags tokens
         * @name TokensPrice
         * @summary Tokens Price
         * @request GET:/tokens/v2/price/{symbol}
         */
        tokensPrice: (symbol: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/price/${symbol}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description type can be either 'gainers' or 'losers'
         *
         * @tags tokens
         * @name TokensTopGainersOrLosers
         * @summary Tokens Top Gainers Or Losers
         * @request GET:/tokens/v2/top/{type}
         */
        tokensTopGainersOrLosers: (type: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/top/${type}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name TokensCountV2
         * @summary Tokens Count V2
         * @request GET:/tokens/v2/count/{pool_id}
         */
        tokensCountV2: (
            poolId: number,
            query: {
                /** Range Start */
                range_start: string
                /** Range Stop */
                range_stop: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/count/${poolId}`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name TokensVolumeGlobal
         * @summary Tokens Volume Global
         * @request GET:/tokens/v2/volume/global
         */
        tokensVolumeGlobal: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tokens/v2/volume/global`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name VolumeByTokensChartV2
         * @summary Volume By Tokens Chart V2
         * @request GET:/tokens/v2/volume/coin/{symbol}/chart
         */
        volumeByTokensChartV2: (symbol: string, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/volume/coin/${symbol}/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tokens
         * @name TokenVolumeByPool
         * @summary Token Volume By Pool
         * @request GET:/tokens/v2/volume/{pool_id}/coin/chart
         */
        tokenVolumeByPool: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tokens/v2/volume/${poolId}/coin/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description **REPLACE BY**: Nothing
         *
         * @tags tokens
         * @name TokensDominance
         * @summary Tokens Dominance
         * @request GET:/tokens/v2/dominance/all
         * @deprecated
         */
        tokensDominance: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tokens/v2/dominance/all`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    liquidity = {
        /**
         * No description
         *
         * @tags liquidity
         * @name LiquidityHistoricalAllChart
         * @summary Liquidity Historical All Chart
         * @request GET:/liquidity/v2/historical/chart
         */
        liquidityHistoricalAllChart: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/liquidity/v2/historical/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    volume = {
        /**
         * No description
         *
         * @tags volume
         * @name VolumeHistoricalAllChartV2
         * @summary Volume Historical All Chart V2
         * @request GET:/volume/v2/historical/chart
         */
        volumeHistoricalAllChartV2: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/volume/v2/historical/chart`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags volume
         * @name TotalVolume
         * @summary Total Volume
         * @request GET:/volume/v2/total
         */
        totalVolume: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/volume/v2/total`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    fees = {
        /**
         * @description total fees paid from all pools since beginning
         *
         * @tags fees
         * @name FeesTotal
         * @summary Fees Total
         * @request GET:/fees/v1/total
         */
        feesTotal: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/fees/v1/total`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description fees paid on 24h and 7d timeframe for all pools
         *
         * @tags fees
         * @name FeesSpentPoolsAll
         * @summary Fees Spent Pools All
         * @request GET:/fees/v1/pools
         */
        feesSpentPoolsAll: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/fees/v1/pools`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description fees paid on 24h and 7d timeframe from a choosen pools
         *
         * @tags fees
         * @name FeesSpentPool
         * @summary Fees Spent Pool
         * @request GET:/fees/v1/{pool_id}
         */
        feesSpentPool: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/fees/v1/${poolId}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description total fees historically paid daily since the beginning
         *
         * @tags fees
         * @name FeesHistorical
         * @summary Fees Historical
         * @request GET:/fees/v1/total/historical
         */
        feesHistorical: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/fees/v1/total/historical`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description total fees historically paid daily since the beginning for a given pool
         *
         * @tags fees
         * @name FeesHistoricalPool
         * @summary Fees Historical Pool
         * @request GET:/fees/v1/historical/{pool_id}
         */
        feesHistoricalPool: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/fees/v1/historical/${poolId}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    search = {
        /**
         * No description
         *
         * @tags search
         * @name SearchAmountTotalSupplyOsmo
         * @summary Search Amount Total Supply Osmo
         * @request GET:/search/v1/supply/osmo
         * @deprecated
         */
        searchAmountTotalSupplyOsmo: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/search/v1/supply/osmo`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * @description - **symbol**: symbol to return in denom
         *
         * @tags search
         * @name SearchDenomByGivenSymbol
         * @summary Search Denom By Given Symbol
         * @request GET:/search/v1/denom
         */
        searchDenomByGivenSymbol: (
            query: {
                /** Symbol */
                symbol: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/search/v1/denom`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * @description - **denom**: denom to return in symbol
         *
         * @tags search
         * @name SearchSymbolByGivenDenom
         * @summary Search Symbol By Given Denom
         * @request GET:/search/v1/symbol
         */
        searchSymbolByGivenDenom: (
            query: {
                /** Denom */
                denom: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/search/v1/symbol`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * @description - **symbol**: symbol to return is exponent
         *
         * @tags search
         * @name SearchExponentByGivenSymbol
         * @summary Search Exponent By Given Symbol
         * @request GET:/search/v1/exponent
         */
        searchExponentByGivenSymbol: (
            query: {
                /** Symbol */
                symbol: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/search/v1/exponent`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),
    }
    apr = {
        /**
         * No description
         *
         * @tags apr
         * @name AprStakingOsmo
         * @summary Apr Staking Osmo
         * @request GET:/apr/v2/staking
         */
        aprStakingOsmo: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/apr/v2/staking`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags apr
         * @name AprAll
         * @summary Apr All
         * @request GET:/apr/v2/all
         */
        aprAll: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/apr/v2/all`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags apr
         * @name AprPerPoolId
         * @summary Apr Per Pool Id
         * @request GET:/apr/v2/{pool_id}
         */
        aprPerPoolId: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/apr/v2/${poolId}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    supply = {
        /**
         * No description
         *
         * @tags supply
         * @name SupplyOsmo
         * @summary Supply Osmo
         * @request GET:/supply/v1/osmo
         */
        supplyOsmo: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/supply/v1/osmo`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags supply
         * @name SupplyIon
         * @summary Supply Ion
         * @request GET:/supply/v1/ion
         */
        supplyIon: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/supply/v1/ion`,
                method: 'GET',
                format: 'json',
                ...params,
            }),
    }
    tradingview = {
        /**
         * No description
         *
         * @tags tradingview
         * @name Token
         * @summary Token
         * @request POST:/tradingview/v1/authorize
         */
        token: (data: BodyTokenTradingviewV1AuthorizePost, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/tradingview/v1/authorize`,
                method: 'POST',
                body: data,
                type: ContentType.UrlEncoded,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tradingview
         * @name GetSymbolInfo
         * @summary Get Symbol Info
         * @request GET:/tradingview/v1/symbol_info
         * @secure
         */
        getSymbolInfo: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tradingview/v1/symbol_info`,
                method: 'GET',
                secure: true,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tradingview
         * @name TokenPriceHistoricalChartV2
         * @summary Token Price Historical Chart V2
         * @request GET:/tradingview/v1/history
         * @secure
         */
        tokenPriceHistoricalChartV2: (
            query: {
                /** Symbol */
                symbol: string
                /** To */
                to: number
                /** Resolution */
                resolution: string
                /** From */
                from: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/tradingview/v1/history`,
                method: 'GET',
                query: query,
                secure: true,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags tradingview
         * @name Streaming
         * @summary Streaming
         * @request GET:/tradingview/v1/streaming
         * @secure
         */
        streaming: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/tradingview/v1/streaming`,
                method: 'GET',
                secure: true,
                format: 'json',
                ...params,
            }),
    }
    stream = {
        /**
         * No description
         *
         * @tags stream
         * @name PoolAllStream
         * @summary Pool All Stream
         * @request GET:/stream/pool/v1/all
         */
        poolAllStream: (
            query?: {
                /**
                 * Min Liquidity
                 * @default 1
                 */
                min_liquidity?: number
                /**
                 * Order Key
                 * @default "liquidity"
                 */
                order_key?: string
                /**
                 * Order By
                 * @default "desc"
                 */
                order_by?: string
                /**
                 * Offset
                 * @default 0
                 */
                offset?: number
                /**
                 * Limit
                 * @default 100
                 */
                limit?: number
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/stream/pool/v1/all`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags stream
         * @name PoolIdStream
         * @summary Pool Id Stream
         * @request GET:/stream/pool/v1/{pool_id}
         */
        poolIdStream: (poolId: number, params: RequestParams = {}) =>
            this.request<any, HTTPValidationError>({
                path: `/stream/pool/v1/${poolId}`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags stream
         * @name TokenAllStream
         * @summary Token All Stream
         * @request GET:/stream/token/v1/all
         */
        tokenAllStream: (params: RequestParams = {}) =>
            this.request<any, any>({
                path: `/stream/token/v1/all`,
                method: 'GET',
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags stream
         * @name TokenSymbolStream
         * @summary Token Symbol Stream
         * @request GET:/stream/token/v1/symbol
         */
        tokenSymbolStream: (
            query: {
                /** Symbol */
                symbol: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/stream/token/v1/symbol`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),

        /**
         * No description
         *
         * @tags stream
         * @name TokenDenomStream
         * @summary Token Denom Stream
         * @request GET:/stream/token/v1/denom
         */
        tokenDenomStream: (
            query: {
                /** Denom */
                denom: string
            },
            params: RequestParams = {}
        ) =>
            this.request<any, HTTPValidationError>({
                path: `/stream/token/v1/denom`,
                method: 'GET',
                query: query,
                format: 'json',
                ...params,
            }),
    }
}
declare global {
    interface FormData {
        append(name: string, value: Blob | string): void
    }

    interface Response {
        json<T = any>(): Promise<T>
        arrayBuffer<T = any>(): Promise<T>
        text<T = any>(): Promise<T>
        formData<T = any>(): Promise<T>
        blob<T = any>(): Promise<T>
    }
}
