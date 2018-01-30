import {
    intersection,
    union,
    interface as required,
    partial as optional,
    literal,
    string,
    number,
    array,
    any,
    object,
    validate
} from "io-ts"

import { FailureError, ParseError, InvalidRequestError } from "./response"
import { Either, tryCatch, right, left } from "fp-ts/lib/Either"

export type JsonReviver = (key: string, value: any) => any

export type RequestParams = any[] | object

export interface BatchRequest extends Array<Request> {
    0: Request
}

export interface Request {
    jsonrpc: "2.0"
    method: string
    params?: RequestParams
    id?: string | number
}

export interface Notification extends Request {
    id?: never
}

const RequestSchema = intersection([
    required({
        jsonrpc: literal("2.0"),
        method: string
    }),
    optional({
        params: union([array(any), object]),
        id: union([string, number])
    })
])

export function Request(
    method: string,
    params?: any[] | object,
    id?: string | number
): Request {
    return {
        jsonrpc: "2.0",
        method,
        ...(params !== undefined ? { params } : {}),
        ...(id !== undefined ? { id } : {})
    }
}

export function isRequest(a: any): a is Request {
    return validate(a, RequestSchema).fold(_ => false, _ => true)
}

export function isNotification(a: any): a is Notification {
    return isRequest(a) && a.id === undefined
}

export function isBatchRequest(a: any): a is BatchRequest {
    return Array.isArray(a) && a.length > 0 && a.every(isRequest)
}

export function parseRequest(
    json: string,
    reviver?: JsonReviver
): Either<FailureError, any> {
    return tryCatch(() => JSON.parse(json, reviver)).mapLeft(
        ({ name, message }) => ParseError({ name, message })
    )
}

export function validateRequest(a: any): Either<FailureError, Request | any[]> {
    return isRequest(a) || isBatchRequest(a)
        ? right(a)
        : left(InvalidRequestError())
}

export function paramsToArgs(params: RequestParams = []): any[] {
    return Array.isArray(params) ? params : [params]
}
