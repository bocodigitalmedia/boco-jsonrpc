"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
const error_1 = require("./failure/error");
exports.FailureSchema = io_ts_1.interface({
    jsonrpc: io_ts_1.literal("2.0"),
    error: error_1.FailureErrorSchema,
    id: io_ts_1.union([io_ts_1.number, io_ts_1.string, io_ts_1.nullType])
});
function Failure(error, id = null) {
    return { jsonrpc: "2.0", error, id };
}
exports.Failure = Failure;
function isFailure(value) {
    return io_ts_1.validate(value, exports.FailureSchema).fold(_ => false, (_) => true);
}
exports.isFailure = isFailure;
