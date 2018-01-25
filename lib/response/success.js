"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
function Success(result, id = null) {
    return { jsonrpc: "2.0", result, id };
}
exports.Success = Success;
const SuccessSchema = io_ts_1.interface({
    jsonrpc: io_ts_1.literal("2.0"),
    result: io_ts_1.any,
    id: io_ts_1.union([io_ts_1.string, io_ts_1.number, io_ts_1.nullType])
});
function isSuccess(a) {
    return io_ts_1.validate(a, SuccessSchema).fold(_ => false, (_) => true);
}
exports.isSuccess = isSuccess;
