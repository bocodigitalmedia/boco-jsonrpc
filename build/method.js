"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./response/failure/error");
const Either_1 = require("fp-ts/lib/Either");
function Method(exec, validateParams = exports.validateParamsFn) {
    return { exec, validateParams };
}
exports.Method = Method;
exports.validateParamsFn = function (params, pass) {
    return params === undefined
        ? pass([])
        : Array.isArray(params) ? pass(params) : pass([params]);
};
function apply({ validateParams, exec }, params) {
    return validateParams(params, pass, fail).fold(l => Promise.reject(l), r => Promise.resolve().then(() => exec(...r)));
}
exports.apply = apply;
function pass(args) {
    return Either_1.right(args);
}
function fail(data, message) {
    return Either_1.left(error_1.InvalidParams(data, message));
}
