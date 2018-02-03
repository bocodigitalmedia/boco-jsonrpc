import { Request as JsonRpcRequest, RequestItem, RequestBatch } from './request'
import {
    Response as JsonRpcResponse,
    ResponseItem,
    ResponseBatch
} from './response'
import { receiveResponseJson } from './client'

export interface FetchClient extends FetchClientOptions {
    url: string
}

export interface FetchClientOptions {
    replacer?: (key: string, val: any) => any
    requestInit?: RequestInit
}

export class InvalidJsonRpcResponse extends Error {
    constructor(public response: any) {
        super(`Invalid JSON RPC response`)
    }
}

export function FetchClient(
    url: string,
    options: FetchClientOptions = {}
): FetchClient {
    return { url, ...options }
}

export function fetchClientRequest(
    request: RequestItem,
    client: FetchClient,
    init?: RequestInit
): Promise<ResponseItem | void>
export function fetchClientRequest(
    request: RequestBatch,
    client: FetchClient,
    init?: RequestInit
): Promise<ResponseBatch | void>
export function fetchClientRequest(
    request: JsonRpcRequest,
    {
        url,
        replacer,
        requestInit: { headers: clientHeaders = {}, ...clientInit } = {}
    }: FetchClient,
    { headers: requestHeaders = {}, ...requestInit }: RequestInit = {}
): Promise<JsonRpcResponse | void> {
    const body = JSON.stringify(request, replacer)

    const headers = mergeHeaders(clientHeaders, requestHeaders, {
        Accept: 'application/json-rpc; application/json',
        'Content-Type': 'application/json-rpc'
    })

    const init: RequestInit = {
        ...clientInit,
        ...requestInit,
        method: 'POST',
        headers,
        body
    }

    return fetch(url, init).then(
        response =>
            response.status === 204
                ? Promise.resolve(undefined)
                : response.text().then(receiveResponseJson)
    )
}

function getHeadersTuples(
    a: (Headers | HeadersInit) & { entries?: () => any }
): string[][] {
    return typeof a.entries === 'function'
        ? [...a.entries()]
        : Array.isArray(a) ? a : [...Object.entries(a)]
}

function mergeHeaders(...args: (Headers | HeadersInit)[]) {
    return args
        .reduce((memo: string[][], a) => [...memo, ...getHeadersTuples(a)], [])
        .reduce((memo, [key, val]) => ({ ...memo, [key]: val }), {})
}
