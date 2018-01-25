import {
    MethodNotFound,
    FailureError,
    isFailureError,
    InternalError
} from "./response/failure/error"

import { Request } from "./request"
import { left, right, Either } from "fp-ts/lib/Either"
import { Method, apply } from "./method"
import { Success } from "./response/success"
import { Failure } from "./response/failure"
import { Response } from "./response"
import { identity } from "fp-ts/lib/function"

export interface Methods {
    [key: string]: Method
}

export type TransformErrorFn = (error: any) => any

export interface Service {
    methods: Methods
    transformError: TransformErrorFn
}

export function Service(
    methods: Methods,
    transformError: TransformErrorFn = identity
): Service {
    return { methods, transformError }
}

export function hasMethod(method: string, service: Service): boolean {
    return service.methods[method] !== undefined
}

export function getMethod(
    request: Request,
    service: Service,
    msg?: string
): Either<FailureError, Method> {
    return hasMethod(request.method, service)
        ? right(service.methods[request.method])
        : left(MethodNotFound({ method: request.method }, msg))
}

export function toFailureError(error: any) {
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

export function handleRequest(
    request: any,
    service: Service
): Promise<Response> {
    const handleError = (error: any) =>
        toFailureError(service.transformError(error))

    return getMethod(request, service)
        .fold(
            l => Promise.reject(l),
            endpoint => apply(endpoint, request.params)
        )
        .then(
            result => Success(result, request.id),
            error => Failure(handleError(error), request.id)
        )
}
