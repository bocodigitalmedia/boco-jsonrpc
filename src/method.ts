import { InvalidParams } from "./response/failure/errors"
import { Either, right, left } from "fp-ts/lib/Either"
import { RequestParams } from "./request"

export type PassFn = (args: any[]) => Either<InvalidParams, any[]>
export type FailFn = (
    data?: any,
    message?: string
) => Either<InvalidParams, any[]>

export type ValidateParamsFn = (
    params: RequestParams | undefined,
    pass: PassFn,
    fail: FailFn
) => Either<InvalidParams, any[]>

export interface Method {
    validateParams: ValidateParamsFn
    exec: Function
}

export function Method(
    exec: Function,
    validateParams: ValidateParamsFn = validateParamsFn
): Method {
    return { exec, validateParams }
}

export const validateParamsFn: ValidateParamsFn = function(params, pass) {
    return params === undefined
        ? pass([])
        : Array.isArray(params) ? pass(params) : pass([params])
}

export function apply(
    { validateParams, exec }: Method,
    params?: RequestParams
): Promise<any> {
    return validateParams(params, pass, fail).fold(
        l => Promise.reject(l),
        r => Promise.resolve().then(() => exec(...r))
    )
}

const pass: PassFn = args => right(args)
const fail: FailFn = (data, message) => left(InvalidParams(data, message))
