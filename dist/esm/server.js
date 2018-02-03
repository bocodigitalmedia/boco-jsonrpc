import { parseRequest, validateRequest, isRequestBatch, requestParamsToArgs } from './request';
import { Success, Failure, isResponse, isResponseBatch, MethodNotFoundError, failureErrorFrom } from './response';
import { left, right } from 'fp-ts/lib/Either';
import { identity } from 'fp-ts/lib/function';
export function Server(methods, { transformError = identity, paramsToArgs = defaultParamsToArgs } = {}) {
    return {
        methods,
        transformError,
        paramsToArgs
    };
}
function defaultParamsToArgs(_method, params) {
    return requestParamsToArgs(params);
}
function hasMethod(key, methods) {
    return (Object.prototype.hasOwnProperty.apply(methods, [key]) &&
        typeof methods[key] === 'function');
}
function getMethod(key, methods) {
    return hasMethod(key, methods)
        ? right(methods[key])
        : left(MethodNotFoundError(key));
}
export function receiveRequestItem({ method, params, id }, { transformError, paramsToArgs, methods }) {
    const handleError = (error) => failureErrorFrom(transformError(error));
    return getMethod(method, methods)
        .fold(l => Promise.reject(l), f => {
        return Promise.resolve()
            .then(() => paramsToArgs(method, params))
            .then(args => f(...args));
    })
        .then(result => Success(result, id), error => Failure(handleError(error), id))
        .then(response => (id === undefined ? undefined : response));
}
export function receiveRequestBatch(requests, service) {
    const promises = requests.map(request => receiveRequestItem(request, service));
    return Promise.all(promises)
        .then(rs => rs.filter(isResponse))
        .then(rs => (isResponseBatch(rs) ? rs : undefined));
}
export function receiveRequest(request, service) {
    return isRequestBatch(request)
        ? receiveRequestBatch(request, service)
        : receiveRequestItem(request, service);
}
export function receiveRequestData(data, service) {
    return validateRequest(data).fold(l => Promise.resolve(Failure(l)), r => receiveRequest(r, service));
}
export function receiveRequestJson(json, service, reviver) {
    return parseRequest(json, reviver).fold(l => Promise.resolve(Failure(l)), r => receiveRequestData(r, service));
}
