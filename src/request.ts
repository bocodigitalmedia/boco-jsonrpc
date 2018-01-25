import {
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
    object,
    validate
} from "io-ts"

import { FailureError } from "./response/failure"
import { ParseError, InvalidRequest } from "./response/failure/errors"
import { Either, tryCatch } from "fp-ts/lib/Either"

export type RequestParams = any[] | object

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
    return validateIO(data, RequestSchema).mapLeft((_: any) =>
        InvalidRequest(msg)
    )
}
