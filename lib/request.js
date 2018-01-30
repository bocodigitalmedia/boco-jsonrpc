"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
const response_1 = require("./response");
const Either_1 = require("fp-ts/lib/Either");
const RequestSchema = io_ts_1.intersection([
    io_ts_1.interface({
        jsonrpc: io_ts_1.literal("2.0"),
        method: io_ts_1.string
    }),
    io_ts_1.partial({
        params: io_ts_1.union([io_ts_1.array(io_ts_1.any), io_ts_1.object]),
        id: io_ts_1.union([io_ts_1.string, io_ts_1.number])
    })
]);
function Request(method, params, id) {
    return Object.assign({ jsonrpc: "2.0", method }, (params !== undefined ? { params } : {}), (id !== undefined ? { id } : {}));
}
exports.Request = Request;
function isRequest(a) {
    return io_ts_1.validate(a, RequestSchema).fold(_ => false, _ => true);
}
exports.isRequest = isRequest;
function isNotification(a) {
    return isRequest(a) && a.id === undefined;
}
exports.isNotification = isNotification;
function isBatchRequest(a) {
    return Array.isArray(a) && a.length > 0 && a.every(isRequest);
}
exports.isBatchRequest = isBatchRequest;
function parseRequest(json, reviver) {
    return Either_1.tryCatch(() => JSON.parse(json, reviver)).mapLeft(({ name, message }) => response_1.ParseError({ name, message }));
}
exports.parseRequest = parseRequest;
function validateRequest(a) {
    return isRequest(a) || isBatchRequest(a)
        ? Either_1.right(a)
        : Either_1.left(response_1.InvalidRequestError());
}
exports.validateRequest = validateRequest;
function paramsToArgs(params = []) {
    return Array.isArray(params) ? params : [params];
}
exports.paramsToArgs = paramsToArgs;
