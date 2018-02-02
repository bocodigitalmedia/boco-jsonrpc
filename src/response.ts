import {
    interface as required,
    partial as optional,
    intersection,
    union,
    strict,
    validate,
    string,
    number,
    nullType,
    literal,
    any
} from "io-ts"

export type Response = Success | Failure

export interface Cases<T> {
    success: (a: Success) => T
    failure: (b: Failure) => T
}

export function caseOf<T>(
    { success, failure }: Cases<T>,
    response: Response
): T {
    return isSuccess(response) ? success(response) : failure(response)
}

export function isResponse(a: any): a is Response {
    return isFailure(a) || isSuccess(a)
}

export function isBatchResponse(a: any): a is Response[] {
    return Array.isArray(a) && a.length > 0 && a.every(isResponse)
}

// ----------------------------------------------------------------------------
// Success
// ----------------------------------------------------------------------------

export interface Success {
    jsonrpc: "2.0"
    result: any
    id: string | number | null
}

export function Success(
    result: any,
    id: string | number | null = null
): Success {
    return { jsonrpc: "2.0", result, id }
}

const SuccessSchema = strict({
    jsonrpc: literal("2.0"),
    result: any,
    id: union([string, number, nullType])
})

export function isSuccess(a: any): a is Success {
    return validate(a, SuccessSchema).fold(_ => false, (_: Success) => true)
}

// ----------------------------------------------------------------------------
// Failure
// ----------------------------------------------------------------------------
export interface Failure<C extends number = number> {
    jsonrpc: "2.0"
    error: FailureError<C>
    id: number | string | null
}

const FailureSchema = required({
    jsonrpc: literal("2.0"),
    error: intersection([
        required({
            message: string,
            code: number
        }),
        optional({
            data: any
        })
    ]),
    id: union([number, string, nullType])
})

export function Failure<C extends number = number>(
    error: FailureError<C>,
    id: number | string | null = null
): Failure<C> {
    return { jsonrpc: "2.0", error, id }
}

export function isFailure(value: any): value is Failure {
    return validate(value, FailureSchema).fold(_ => false, (_: Failure) => true)
}

// ----------------------------------------------------------------------------
// FailureError
// ----------------------------------------------------------------------------

export interface FailureError<C extends number = number> {
    code: C
    message: string
    data?: any
}

export function FailureError<C extends number = number>(
    code: C,
    message: string,
    data?: any
): FailureError<C> {
    return { code, message, ...(data !== undefined ? { data } : {}) }
}

const FailureErrorSchema = FailureSchema.props.error

export function failureErrorFactory<C extends number = number>(
    code: C,
    defaultMessage: string
) {
    return (data?: any, message: string = defaultMessage) =>
        FailureError(code, message, data)
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

        return InternalError(errorData)
    }

    return InternalError(error)
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

// ----------------------------------------------------------------------------
// Defined Failure Errors
// ----------------------------------------------------------------------------

export type ParseError = FailureError<typeof PARSE_ERROR>
export type InvalidRequestError = FailureError<typeof INVALID_REQUEST_ERROR>
export type MethodNotFoundError = FailureError<typeof METHOD_NOT_FOUND_ERROR>
export type InvalidParamsError = FailureError<typeof INVALID_PARAMS_ERROR>
export type InternalError = FailureError<typeof INTERNAL_ERROR>

export const PARSE_ERROR = -32700
export const INVALID_REQUEST_ERROR = -32600
export const METHOD_NOT_FOUND_ERROR = -32601
export const INVALID_PARAMS_ERROR = -32602
export const INTERNAL_ERROR = -32603

export const ParseError = failureErrorFactory(PARSE_ERROR, "Parse error")

export const InvalidRequestError = failureErrorFactory(
    INVALID_REQUEST_ERROR,
    "Invalid request"
)
export const MethodNotFoundError = failureErrorFactory(
    METHOD_NOT_FOUND_ERROR,
    "Method not found"
)
export const InvalidParamsError = failureErrorFactory(
    INVALID_PARAMS_ERROR,
    "Invalid params"
)
export const InternalError = failureErrorFactory(
    INTERNAL_ERROR,
    "Internal error"
)

export const isParseError = isFailureErrorWithCode(PARSE_ERROR)

export const isInvalidRequestError = isFailureErrorWithCode(
    INVALID_REQUEST_ERROR
)

export const isMethodNotFoundError = isFailureErrorWithCode(
    METHOD_NOT_FOUND_ERROR
)

export const isInvalidParamsError = isFailureErrorWithCode(INVALID_PARAMS_ERROR)

export const isInternalError = isFailureErrorWithCode(INTERNAL_ERROR)
