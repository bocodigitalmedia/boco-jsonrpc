import { tryCatch } from 'fp-ts/lib/either'
import { Response, validateResponse } from './response'

export function receiveResponseData(data: any): Promise<Response> {
    return validateResponse(data).fold(
        l => Promise.reject(l),
        r => Promise.resolve(r)
    )
}

export function receiveResponseJson(json: string): Promise<Response> {
    return tryCatch(() => JSON.parse(json)).fold(
        l => Promise.reject(l),
        r => receiveResponseData(r)
    )
}
