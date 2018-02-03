import {
    Request,
    RequestItem,
    RequestBatch,
    parseRequest,
    validateRequest,
    isRequestBatch,
    RequestParams,
    requestParamsToArgs,
    JsonReviver
} from './request'

import {
    Success,
    Failure,
    Response,
    ResponseItem,
    ResponseBatch,
    isResponse,
    isResponseBatch,
    FailureError,
    MethodNotFoundError,
    failureErrorFrom
} from './response'

import { left, right, Either } from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'

export interface Methods {
    [key: string]: Function
}

export type TransformErrorFn = (error: any) => any

export type ParamsToArgsFn = (method: string, params?: RequestParams) => any[]

export interface Server extends ServiceOptions {
    methods: Methods
}

export interface ServiceOptions {
    transformError: TransformErrorFn
    paramsToArgs: ParamsToArgsFn
}

export function Server(
    methods: Methods,
    {
        transformError = identity,
        paramsToArgs = defaultParamsToArgs
    }: Partial<ServiceOptions> = {}
): Server {
    return {
        methods,
        transformError,
        paramsToArgs
    }
}

function defaultParamsToArgs(_method: string, params?: RequestParams) {
    return requestParamsToArgs(params)
}

function hasMethod(key: string, methods: Methods): boolean {
    return (
        Object.prototype.hasOwnProperty.apply(methods, [key]) &&
        typeof methods[key] === 'function'
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

export function receiveRequestItem(
    { method, params, id }: RequestItem,
    { transformError, paramsToArgs, methods }: Server
): Promise<ResponseItem | void> {
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

export function receiveRequestBatch(
    requests: RequestBatch,
    service: Server
): Promise<ResponseBatch | void> {
    const promises = requests.map(request =>
        receiveRequestItem(request, service)
    )

    return Promise.all(promises)
        .then(rs => rs.filter(isResponse))
        .then(rs => (isResponseBatch(rs) ? rs : undefined))
}

export function receiveRequest(
    request: Request,
    service: Server
): Promise<Response | void> {
    return isRequestBatch(request)
        ? receiveRequestBatch(request, service)
        : receiveRequestItem(request, service)
}

export function receiveRequestData(
    data: any,
    service: Server
): Promise<Response | void> {
    return validateRequest(data).fold(
        l => Promise.resolve(Failure(l)),
        r => receiveRequest(r, service)
    )
}

export function receiveRequestJson(
    json: string,
    service: Server,
    reviver?: JsonReviver
): Promise<Response | void> {
    return parseRequest(json, reviver).fold(
        l => Promise.resolve(Failure(l)),
        r => receiveRequestData(r, service)
    )
}
