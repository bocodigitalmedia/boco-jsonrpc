"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
function FailureConstructor(error, id) {
    return { jsonrpc: '2.0', error, id };
}
const ioType = io_ts_1.intersection([
    io_ts_1.type({
        jsonrpc: io_ts_1.literal('2.0'),
        error: io_ts_1.any
    }),
    io_ts_1.partial({
        id: io_ts_1.union([io_ts_1.string, io_ts_1.number])
    })
]);
exports.Failure = Object.assign(FailureConstructor, { ioType });
