import {
    TypeOf,
    validate as validateIO,
    intersection,
    union,
    interface as required,
    partial as optional,
    literal,
    string,
    number,
    array,
    any,
    object
} from "io-ts"

import {
    FailureError,
    ParseError,
    InvalidRequest
} from "./response/failure/error"

import { Either, tryCatch } from "fp-ts/lib/Either"

export type RequestIO = TypeOf<typeof RequestIO>
export type RequestParams = any[] | object

export interface Request {
    jsonrpc: "2.0"
    method: string
    id?: string | number | null
    params?: RequestParams
}

export const RequestIO = intersection(
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

export function fromRequestIO(io: RequestIO): Request {
    return Request(io.method, io.params, io.id)
}

export function parseRequest(
    json: string,
    msg?: string
): Either<FailureError, any> {
    return tryCatch(() => JSON.parse(json)).mapLeft(({ name, message }) =>
        ParseError({ name, message }, msg)
    )
}

export function validateRequest(
    data: any,
    msg?: string
): Either<FailureError, Request> {
    return validateIO(data, RequestIO)
        .mapLeft((_: any) => InvalidRequest(msg))
        .map(fromRequestIO)
}
