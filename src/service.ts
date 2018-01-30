import {
    Request,
    parseRequest,
    validateRequest,
    RequestParams,
    paramsToArgs,
    JsonReviver
} from "./request"

import {
    Success,
    Failure,
    Response,
    FailureError,
    MethodNotFoundError,
    failureErrorFrom
} from "./response"

import { left, right, Either } from "fp-ts/lib/Either"
import { identity } from "fp-ts/lib/function"

export interface Methods {
    [key: string]: Function
}

export type TransformErrorFn = (error: any) => any

export type ParamsToArgsFn = (method: string, params?: RequestParams) => any[]

export interface Service extends ServiceOptions {
    methods: Methods
}

export interface ServiceOptions {
    transformError: TransformErrorFn
    paramsToArgs: ParamsToArgsFn
}

export function Service(
    methods: Methods,
    {
        transformError = identity,
        paramsToArgs = defaultParamsToArgs
    }: Partial<ServiceOptions> = {}
): Service {
    return {
        methods,
        transformError,
        paramsToArgs
    }
}

function defaultParamsToArgs(_method: string, params?: RequestParams) {
    return paramsToArgs(params)
}

function hasMethod(key: string, methods: Methods): boolean {
    return (
        Object.prototype.hasOwnProperty.apply(methods, [key]) &&
        typeof methods[key] === "function"
    )
}

function getMethod(
    key: string,
    methods: Methods
): Either<FailureError, Function> {
    return hasMethod(key, methods)
        ? right(methods[key])
        : left(MethodNotFoundError(key))
}

export function receiveRequest(
    { method, params, id }: Request,
    { transformError, paramsToArgs, methods }: Service
): Promise<Response | void> {
    const handleError = (error: any) => failureErrorFrom(transformError(error))

    return getMethod(method, methods)
        .fold(
            l => Promise.reject(l),
            f => {
                return Promise.resolve()
                    .then(() => paramsToArgs(method, params))
                    .then(args => f(...args))
            }
        )
        .then(
            result => Success(result, id),
            error => Failure(handleError(error), id)
        )
        .then(response => (id === undefined ? undefined : response))
}

export function receiveRequests(
    requests: Request[],
    service: Service
): Promise<Response[] | void> {
    const promises = requests.map(request => receiveRequest(request, service))

    return Promise.all(promises)
        .then(responses => responses.filter(v => v !== undefined) as Response[])
        .then(responses => (responses.length > 0 ? responses : undefined))
}

export function receiveData(
    data: any,
    service: Service
): Promise<Response | Response[] | void> {
    return validateRequest(data).fold(
        l => Promise.resolve(Failure(l)),
        r =>
            Array.isArray(r)
                ? receiveRequests(r, service)
                : receiveRequest(r, service)
    )
}

export function receiveJson(
    json: string,
    service: Service,
    reviver?: JsonReviver
): Promise<Response | Response[] | void> {
    return parseRequest(json, reviver).fold(
        l => Promise.resolve(Failure(l)),
        r => receiveData(r, service)
    )
}
