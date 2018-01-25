import { InvalidParams } from "./response/failure/error"
import { Either, right, left } from "fp-ts/lib/Either"
import { RequestParams } from "./request"

export type ValidateParamsFn = (
    params: RequestParams | undefined,
    pass_: typeof pass,
    fail_: typeof fail
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

function pass(args: any[]): Either<InvalidParams, any[]> {
    return right(args)
}

function fail(data?: any, message?: string): Either<InvalidParams, any[]> {
    return left(InvalidParams(data, message))
}
