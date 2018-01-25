import {
    interface as required,
    partial as optional,
    intersection,
    literal,
    union,
    number,
    string,
    nullType,
    any,
    validate
} from "io-ts"

import * as errors from "./failure/errors"
export { errors }

export interface FailureError<C extends number = number> {
    code: C
    message: string
    data?: any
}

export interface Failure {
    jsonrpc: "2.0"
    error: FailureError
    id: number | string | null
}

const FailureErrorSchema = intersection([
    required({
        message: string,
        code: number
    }),
    optional({
        data: any
    })
])

const FailureSchema = required({
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

export function FailureError<C extends number = number>(
    code: C,
    message: string,
    data?: any
): FailureError<C> {
    return { code, message, ...(data !== undefined ? { data } : {}) }
}

export function FailureErrorFactory<C extends number = number>(
    code: C,
    defaultMessage: string
) {
    return (data?: any, message: string = defaultMessage) =>
        FailureError(code, message, data)
}

export function isFailure(value: any): value is Failure {
    return validate(value, FailureSchema).fold(_ => false, (_: Failure) => true)
}

export function isFailureError(e: any): e is FailureError {
    return validate(e, FailureErrorSchema).fold(
        (_: any) => false,
        (_: FailureError) => true
    )
}

export function isFailureErrorWithCode<C extends number = number>(code: C) {
    return (e: any): e is FailureError<C> =>
        isFailureError(e) && e.code === code
}

export function failureErrorFrom(error: any): FailureError {
    if (isFailureError(error)) {
        return FailureError(error.code, error.message, error.data)
    }

    if (typeof error === "object" && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== "stack")
            .reduce((memo, key) => ({ ...memo, [key]: error[key] }), {
                name: error.name
            })

        return errors.InternalError(errorData)
    }

    return errors.InternalError(error)
}
