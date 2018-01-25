"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
exports.PARSE_ERROR = -32700;
exports.INVALID_REQUEST = -32600;
exports.METHOD_NOT_FOUND = -32601;
exports.INVALID_PARAMS = -32602;
exports.INTERNAL_ERROR = -32603;
exports.FailureErrorSchema = io_ts_1.intersection([
    io_ts_1.interface({
        message: io_ts_1.string,
        code: io_ts_1.number
    }),
    io_ts_1.partial({
        data: io_ts_1.any
    })
]);
function FailureError(code, message, data) {
    return Object.assign({ code, message }, (data !== undefined ? { data } : {}));
}
exports.FailureError = FailureError;
function factory(code, defaultMessage) {
    return (data, message = defaultMessage) => FailureError(code, message, data);
}
exports.factory = factory;
function isFailureError(e) {
    return io_ts_1.validate(e, exports.FailureErrorSchema).fold((_) => false, (_) => true);
}
exports.isFailureError = isFailureError;
function isFailureErrorWithCode(code) {
    return (e) => isFailureError(e) && e.code === code;
}
exports.isFailureErrorWithCode = isFailureErrorWithCode;
exports.ParseError = factory(exports.PARSE_ERROR, "Parse error");
exports.InvalidRequest = factory(exports.INVALID_REQUEST, "Invalid request");
exports.MethodNotFound = factory(exports.METHOD_NOT_FOUND, "Method not found");
exports.InvalidParams = factory(exports.INVALID_PARAMS, "Invalid params");
exports.InternalError = factory(exports.INTERNAL_ERROR, "Internal error");
exports.isParseError = isFailureErrorWithCode(exports.PARSE_ERROR);
exports.isInvalidRequest = isFailureErrorWithCode(exports.INVALID_REQUEST);
exports.isMethodNotFound = isFailureErrorWithCode(exports.METHOD_NOT_FOUND);
exports.isInvalidParams = isFailureErrorWithCode(exports.INVALID_PARAMS);
exports.isInternalError = isFailureErrorWithCode(exports.INTERNAL_ERROR);
