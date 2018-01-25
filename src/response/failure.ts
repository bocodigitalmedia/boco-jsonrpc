import {
    TypeOf,
    interface as required,
    literal,
    union,
    number,
    string,
    nullType,
    validate
} from "io-ts"

import { FailureError, FailureErrorSchema } from "./failure/error"

export type FailureIO = TypeOf<typeof FailureSchema>

export interface Failure {
    jsonrpc: "2.0"
    error: FailureError
    id: number | string | null
}

export const FailureSchema = required({
    jsonrpc: literal("2.0"),
    error: FailureErrorSchema,
    id: union([number, string, nullType])
})

export function Failure(
    error: FailureError,
    id: number | string | null = null
): Failure {
    return { jsonrpc: "2.0", error, id }
}

export function isFailure(value: any): value is Failure {
    return validate(value, FailureSchema).fold(_ => false, (_: Failure) => true)
}
