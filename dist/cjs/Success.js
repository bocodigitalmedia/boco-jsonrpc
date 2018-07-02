"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
const ioType = io_ts_1.strict({
    jsonrpc: io_ts_1.literal('2.0'),
    result: io_ts_1.any,
    id: io_ts_1.union([io_ts_1.string, io_ts_1.number])
});
function SuccessConstructor(result, id) {
    return {
        jsonrpc: '2.0',
        result,
        id
    };
}
exports.Success = Object.assign(SuccessConstructor, { ioType });
