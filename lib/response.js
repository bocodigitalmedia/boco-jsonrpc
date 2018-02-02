"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
function caseOf({ success, failure }, response) {
    return isSuccess(response) ? success(response) : failure(response);
}
exports.caseOf = caseOf;
function isResponse(a) {
    return isFailure(a) || isSuccess(a);
}
exports.isResponse = isResponse;
function isBatchResponse(a) {
    return Array.isArray(a) && a.length > 0 && a.every(isResponse);
}
exports.isBatchResponse = isBatchResponse;
function Success(result, id = null) {
    return { jsonrpc: "2.0", result, id };
}
exports.Success = Success;
const SuccessSchema = io_ts_1.strict({
    jsonrpc: io_ts_1.literal("2.0"),
    result: io_ts_1.any,
    id: io_ts_1.union([io_ts_1.string, io_ts_1.number, io_ts_1.nullType])
});
function isSuccess(a) {
    return io_ts_1.validate(a, SuccessSchema).fold(_ => false, (_) => true);
}
exports.isSuccess = isSuccess;
const FailureSchema = io_ts_1.interface({
    jsonrpc: io_ts_1.literal("2.0"),
    error: io_ts_1.intersection([
        io_ts_1.interface({
            message: io_ts_1.string,
            code: io_ts_1.number
        }),
        io_ts_1.partial({
            data: io_ts_1.any
        })
    ]),
    id: io_ts_1.union([io_ts_1.number, io_ts_1.string, io_ts_1.nullType])
});
function Failure(error, id = null) {
    return { jsonrpc: "2.0", error, id };
}
exports.Failure = Failure;
function isFailure(value) {
    return io_ts_1.validate(value, FailureSchema).fold(_ => false, (_) => true);
}
exports.isFailure = isFailure;
function FailureError(code, message, data) {
    return Object.assign({ code, message }, (data !== undefined ? { data } : {}));
}
exports.FailureError = FailureError;
const FailureErrorSchema = FailureSchema.props.error;
function failureErrorFactory(code, defaultMessage) {
    return (data, message = defaultMessage) => FailureError(code, message, data);
}
exports.failureErrorFactory = failureErrorFactory;
function failureErrorFrom(error) {
    if (isFailureError(error)) {
        return FailureError(error.code, error.message, error.data);
    }
    if (typeof error === "object" && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== "stack")
            .reduce((memo, key) => (Object.assign({}, memo, { [key]: error[key] })), {
            name: error.name
        });
        return exports.InternalError(errorData);
    }
    return exports.InternalError(error);
}
exports.failureErrorFrom = failureErrorFrom;
function isFailureError(e) {
    return io_ts_1.validate(e, FailureErrorSchema).fold((_) => false, (_) => true);
}
exports.isFailureError = isFailureError;
function isFailureErrorWithCode(code) {
    return (e) => isFailureError(e) && e.code === code;
}
exports.isFailureErrorWithCode = isFailureErrorWithCode;
exports.PARSE_ERROR = -32700;
exports.INVALID_REQUEST_ERROR = -32600;
exports.METHOD_NOT_FOUND_ERROR = -32601;
exports.INVALID_PARAMS_ERROR = -32602;
exports.INTERNAL_ERROR = -32603;
exports.ParseError = failureErrorFactory(exports.PARSE_ERROR, "Parse error");
exports.InvalidRequestError = failureErrorFactory(exports.INVALID_REQUEST_ERROR, "Invalid request");
exports.MethodNotFoundError = failureErrorFactory(exports.METHOD_NOT_FOUND_ERROR, "Method not found");
exports.InvalidParamsError = failureErrorFactory(exports.INVALID_PARAMS_ERROR, "Invalid params");
exports.InternalError = failureErrorFactory(exports.INTERNAL_ERROR, "Internal error");
exports.isParseError = isFailureErrorWithCode(exports.PARSE_ERROR);
exports.isInvalidRequestError = isFailureErrorWithCode(exports.INVALID_REQUEST_ERROR);
exports.isMethodNotFoundError = isFailureErrorWithCode(exports.METHOD_NOT_FOUND_ERROR);
exports.isInvalidParamsError = isFailureErrorWithCode(exports.INVALID_PARAMS_ERROR);
exports.isInternalError = isFailureErrorWithCode(exports.INTERNAL_ERROR);
