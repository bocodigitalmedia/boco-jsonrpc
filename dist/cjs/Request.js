"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Either_1 = require("fp-ts/lib/Either");
const PathReporter_1 = require("io-ts/lib/PathReporter");
const InvalidRequest_1 = require("./InvalidRequest");
const io_ts_1 = require("io-ts");
const ParseError_1 = require("./ParseError");
function RequestConstructor(method, params, id) {
    return { jsonrpc: '2.0', method, params, id };
}
const ioType = io_ts_1.intersection([
    io_ts_1.type({
        jsonrpc: io_ts_1.literal('2.0'),
        method: io_ts_1.string
    }),
    io_ts_1.partial({
        id: io_ts_1.union([io_ts_1.string, io_ts_1.number]),
        params: io_ts_1.union([io_ts_1.object, io_ts_1.array(io_ts_1.any)])
    })
], 'Request');
const validate = (request) => ioType
    .decode(request)
    .mapLeft(errors => InvalidRequest_1.InvalidRequest({ request, errors: PathReporter_1.failure(errors) }));
const parse = (json) => Either_1.tryCatch(() => JSON.parse(json))
    .mapLeft(e => ParseError_1.ParseError({ json, message: e.message }))
    .chain(data => validate(data));
const hasId = (request) => ['string', 'number'].includes(typeof request.id);
exports.Request = Object.assign(RequestConstructor, {
    ioType,
    validate,
    hasId,
    parse
});
