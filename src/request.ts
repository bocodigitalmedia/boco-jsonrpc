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

import { FailureError } from "./response/failure"
import { ParseError, InvalidRequest } from "./response/failure/errors"
import { Either, tryCatch, right, left } from "fp-ts/lib/Either"

export type RequestParams = any[] | object
export type JsonReviver = (key: string, value: any) => any

export interface Request {
    jsonrpc: "2.0"
    method: string
    id?: string | number | null
    params?: RequestParams
}

const RequestSchema = intersection(
    [
        required({
            jsonrpc: literal("2.0"),
            method: string
        }),
        optional({
            id: union([string, number]),
            params: union([array(any), object])
        })
    ],
    "jsonrpc.request"
)

export function Request(
    method: string,
    params?: any[] | object,
    id?: string | number | null
): Request {
    return {
        jsonrpc: "2.0",
        method,
        ...(params !== undefined ? { params } : {}),
        ...(id !== undefined ? { id } : {})
    }
}

export function isRequest(a: any): a is Request {
    return validate(a, RequestSchema).fold(
        (_: any) => false,
        (_: Request) => true
    )
}

export function isRequestArray(a: any): a is Request[] {
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
    return isRequest(a) || isRequestArray(a) ? right(a) : left(InvalidRequest())
}

export function paramsToArguments(params?: RequestParams): any[] {
    return params === undefined ? [] : Array.isArray(params) ? params : [params]
}
