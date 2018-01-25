"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./response/failure/errors");
const failure_1 = require("./response/failure");
const Either_1 = require("fp-ts/lib/Either");
const method_1 = require("./method");
const success_1 = require("./response/success");
const failure_2 = require("./response/failure");
const function_1 = require("fp-ts/lib/function");
function Service(methods, transformError = function_1.identity) {
    return { methods, transformError };
}
exports.Service = Service;
function hasMethod(method, service) {
    return service.methods[method] !== undefined;
}
exports.hasMethod = hasMethod;
function getMethod(request, service, msg) {
    return hasMethod(request.method, service)
        ? Either_1.right(service.methods[request.method])
        : Either_1.left(errors_1.MethodNotFound({ method: request.method }, msg));
}
exports.getMethod = getMethod;
function toFailureError(error) {
    if (failure_1.isFailureError(error)) {
        return failure_1.FailureError(error.code, error.message, error.data);
    }
    if (typeof error === "object" && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== "stack")
            .reduce((memo, key) => (Object.assign({}, memo, { [key]: error[key] })), {
            name: error.name
        });
        return errors_1.InternalError(errorData);
    }
    return errors_1.InternalError(error);
}
exports.toFailureError = toFailureError;
function handleRequest(request, service) {
    const handleError = (error) => toFailureError(service.transformError(error));
    return getMethod(request, service)
        .fold(l => Promise.reject(l), endpoint => method_1.apply(endpoint, request.params))
        .then(result => success_1.Success(result, request.id), error => failure_2.Failure(handleError(error), request.id));
}
exports.handleRequest = handleRequest;
