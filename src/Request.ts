// @ts-ignore
import { FailureError } from './FailureError'

import { Either, tryCatch } from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { InvalidRequest } from './InvalidRequest'
import {
    Type,
    literal,
    type,
    union,
    string,
    number,
    object,
    intersection,
    partial,
    array,
    any
} from 'io-ts'
import { ParseError } from './ParseError'

export interface Request {
    jsonrpc: '2.0'
    method: string
    params?: object | any[]
    id?: string | number
}

function RequestConstructor(
    method: string,
    params: object,
    id: string | number
): Request {
    return { jsonrpc: '2.0', method, params, id }
}

const ioType: Type<Request> = intersection(
    [
        type({
            jsonrpc: literal('2.0'),
            method: string
        }),
        partial({
            id: union([string, number]),
            params: union([object, array(any)])
        })
    ],
    'Request'
)

const validate = (request: any): Either<InvalidRequest, Request> =>
    ioType
        .decode(request)
        .mapLeft(errors => InvalidRequest({ request, errors: failure(errors) }))

const parse = (json: string): Either<ParseError | InvalidRequest, Request> =>
    tryCatch<{}>(() => JSON.parse(json))
        .mapLeft<ParseError | InvalidRequest>(e =>
            ParseError({ json, message: e.message })
        )
        .chain(data => validate(data))

const hasId = (
    request: Request
): request is Request & { id: string | number } =>
    ['string', 'number'].includes(typeof request.id)

export const Request = Object.assign(RequestConstructor, {
    ioType,
    validate,
    hasId,
    parse
})
