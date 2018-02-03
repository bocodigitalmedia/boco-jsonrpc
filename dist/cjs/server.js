"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const response_1 = require("./response");
const Either_1 = require("fp-ts/lib/Either");
const function_1 = require("fp-ts/lib/function");
function Server(methods, { transformError = function_1.identity, paramsToArgs = defaultParamsToArgs } = {}) {
    return {
        methods,
        transformError,
        paramsToArgs
    };
}
exports.Server = Server;
function defaultParamsToArgs(_method, params) {
    return request_1.requestParamsToArgs(params);
}
function hasMethod(key, methods) {
    return (Object.prototype.hasOwnProperty.apply(methods, [key]) &&
        typeof methods[key] === 'function');
}
function getMethod(key, methods) {
    return hasMethod(key, methods)
        ? Either_1.right(methods[key])
        : Either_1.left(response_1.MethodNotFoundError(key));
}
function receiveRequestItem({ method, params, id }, { transformError, paramsToArgs, methods }) {
    const handleError = (error) => response_1.failureErrorFrom(transformError(error));
    return getMethod(method, methods)
        .fold(l => Promise.reject(l), f => {
        return Promise.resolve()
            .then(() => paramsToArgs(method, params))
            .then(args => f(...args));
    })
        .then(result => response_1.Success(result, id), error => response_1.Failure(handleError(error), id))
        .then(response => (id === undefined ? undefined : response));
}
exports.receiveRequestItem = receiveRequestItem;
function receiveRequestBatch(requests, service) {
    const promises = requests.map(request => receiveRequestItem(request, service));
    return Promise.all(promises)
        .then(rs => rs.filter(response_1.isResponse))
        .then(rs => (response_1.isResponseBatch(rs) ? rs : undefined));
}
exports.receiveRequestBatch = receiveRequestBatch;
function receiveRequest(request, service) {
    return request_1.isRequestBatch(request)
        ? receiveRequestBatch(request, service)
        : receiveRequestItem(request, service);
}
exports.receiveRequest = receiveRequest;
function receiveRequestData(data, service) {
    return request_1.validateRequest(data).fold(l => Promise.resolve(response_1.Failure(l)), r => receiveRequest(r, service));
}
exports.receiveRequestData = receiveRequestData;
function receiveRequestJson(json, service, reviver) {
    return request_1.parseRequest(json, reviver).fold(l => Promise.resolve(response_1.Failure(l)), r => receiveRequestData(r, service));
}
exports.receiveRequestJson = receiveRequestJson;
