import { Request } from "../request"
import { isBatchResponse, isResponse } from "../response"

export interface FetchClient extends FetchClientOptions {
    url: string
}

export interface FetchClientOptions {
    replacer?: (key: string, val: any) => any
    requestInit?: RequestInit
}

export class InvalidResponse extends Error {
    constructor(public response: Response) {
        super(`Invalid response`)
    }
}

export function FetchClient(
    url: string,
    options: FetchClientOptions = {}
): FetchClient {
    return { url, ...options }
}

export function isJsonResponse(response: Response) {
    const pattern = /^application\/(json-rpc|json)(;\s+.*)?$/i
    const type = response.headers.get("Content-Type") || ""
    return pattern.test(type)
}

export function sendRequest(
    request: Request,
    {
        url,
        replacer,
        requestInit: { headers: clientHeaders = {}, ...clientInit } = {}
    }: FetchClient,
    { headers: requestHeaders = {}, ...requestInit }: RequestInit = {}
) {
    const body = JSON.stringify(request, replacer)

    const headers = mergeHeaders(clientHeaders, requestHeaders, {
        Accept: "application/json-rpc; application/json",
        "Content-Type": "application/json-rpc"
    })

    const init: RequestInit = {
        ...clientInit,
        ...requestInit,
        method: "POST",
        headers,
        body
    }

    return fetch(url, init)
        .then(
            response =>
                response.status === 204
                    ? Promise.resolve()
                    : isJsonResponse(response)
                      ? Promise.resolve(response.json())
                      : Promise.reject(new InvalidResponse(response))
        )
        .then(
            data =>
                isResponse(data) || isBatchResponse(data) || data === undefined
                    ? Promise.resolve(data)
                    : Promise.reject(new InvalidResponse(data))
        )
}

function getHeadersTuples(
    a: (Headers | HeadersInit) & { entries?: () => any }
): string[][] {
    return typeof a.entries === "function"
        ? [...a.entries()]
        : Array.isArray(a) ? a : [...Object.entries(a)]
}

function mergeHeaders(...args: (Headers | HeadersInit)[]) {
    return args
        .reduce((memo: string[][], a) => [...memo, ...getHeadersTuples(a)], [])
        .reduce((memo, [key, val]) => ({ ...memo, [key]: val }), {})
}
