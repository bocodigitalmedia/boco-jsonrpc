"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
const errors_1 = require("./response/failure/errors");
const Either_1 = require("fp-ts/lib/Either");
const RequestSchema = io_ts_1.intersection([
    io_ts_1.interface({
        jsonrpc: io_ts_1.literal("2.0"),
        method: io_ts_1.string
    }),
    io_ts_1.partial({
        id: io_ts_1.union([io_ts_1.string, io_ts_1.number]),
        params: io_ts_1.union([io_ts_1.array(io_ts_1.any), io_ts_1.object])
    })
], "jsonrpc.request");
function Request(method, params, id) {
    return Object.assign({ jsonrpc: "2.0", method }, (params !== undefined ? { params } : {}), (id !== undefined ? { id } : {}));
}
exports.Request = Request;
function isRequest(a) {
    return io_ts_1.validate(a, RequestSchema).fold((_) => false, (_) => true);
}
exports.isRequest = isRequest;
function parseRequest(json, msg) {
    return Either_1.tryCatch(() => JSON.parse(json)).mapLeft(({ name, message }) => errors_1.ParseError({ name, message }, msg));
}
exports.parseRequest = parseRequest;
function validateRequest(data, msg) {
    return io_ts_1.validate(data, RequestSchema).mapLeft((_) => errors_1.InvalidRequest(msg));
}
exports.validateRequest = validateRequest;
