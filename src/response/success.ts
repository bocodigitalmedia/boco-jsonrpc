import {
    interface as required,
    union,
    string,
    number,
    nullType,
    literal,
    any,
    validate
} from "io-ts"

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

const SuccessSchema = required({
    jsonrpc: literal("2.0"),
    result: any,
    id: union([string, number, nullType])
})

export function isSuccess(a: any): a is Success {
    return validate(a, SuccessSchema).fold(_ => false, (_: Success) => true)
}
