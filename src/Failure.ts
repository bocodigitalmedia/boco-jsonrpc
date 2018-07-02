import { FailureError } from '.'
import {
    Type,
    intersection,
    partial,
    any,
    string,
    number,
    literal,
    union,
    type
} from 'io-ts'

export interface Failure<E extends FailureError = FailureError> {
    jsonrpc: '2.0'
    error: E
    id?: string | number
    result?: never
}

function FailureConstructor<E extends FailureError>(
    error: E,
    id?: string | number
): Failure<E> {
    return { jsonrpc: '2.0', error, id }
}

const ioType: Type<Failure> = intersection([
    type({
        jsonrpc: literal('2.0'),
        error: any
    }),
    partial({
        id: union([string, number])
    })
])

export const Failure = Object.assign(FailureConstructor, { ioType })
