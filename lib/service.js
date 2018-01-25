"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const errors_1 = require("./response/failure/errors");
const failure_1 = require("./response/failure");
const success_1 = require("./response/success");
const failure_2 = require("./response/failure");
const Either_1 = require("fp-ts/lib/Either");
const function_1 = require("fp-ts/lib/function");
function Service(methods, { transformError = function_1.identity, paramsToArgs = defaultParamsToArgs } = {}) {
    return {
        methods,
        transformError,
        paramsToArgs
    };
}
exports.Service = Service;
function defaultParamsToArgs(_method, params) {
    return request_1.paramsToArguments(params);
}
function hasMethod(key, methods) {
    return (Object.prototype.hasOwnProperty.apply(methods, [key]) &&
        typeof methods[key] === "function");
}
function getMethod(key, methods) {
    return hasMethod(key, methods)
        ? Either_1.right(methods[key])
        : Either_1.left(errors_1.MethodNotFound(key));
}
function receiveRequest({ method, params, id }, { transformError, paramsToArgs, methods }) {
    const handleError = (error) => failure_1.failureErrorFrom(transformError(error));
    return getMethod(method, methods)
        .fold(l => Promise.reject(l), f => {
        return Promise.resolve()
            .then(() => paramsToArgs(method, params))
            .then(args => f(...args));
    })
        .then(result => success_1.Success(result, id), error => failure_2.Failure(handleError(error), id))
        .then(response => (id === undefined ? undefined : response));
}
exports.receiveRequest = receiveRequest;
function receiveRequests(requests, service) {
    const promises = requests.map(request => receiveRequest(request, service));
    return Promise.all(promises)
        .then(responses => responses.filter(v => v !== undefined))
        .then(responses => (responses.length > 0 ? responses : undefined));
}
exports.receiveRequests = receiveRequests;
function receiveData(data, service) {
    return request_1.validateRequest(data).fold(l => Promise.resolve(failure_2.Failure(l)), r => Array.isArray(r)
        ? receiveRequests(r, service)
        : receiveRequest(r, service));
}
exports.receiveData = receiveData;
function receiveJson(json, service, reviver) {
    return request_1.parseRequest(json, reviver).fold(l => Promise.resolve(failure_2.Failure(l)), r => receiveData(r, service));
}
exports.receiveJson = receiveJson;
