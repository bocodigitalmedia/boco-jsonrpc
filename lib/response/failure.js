"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_ts_1 = require("io-ts");
const errors = require("./failure/errors");
exports.errors = errors;
const FailureErrorSchema = io_ts_1.intersection([
    io_ts_1.interface({
        message: io_ts_1.string,
        code: io_ts_1.number
    }),
    io_ts_1.partial({
        data: io_ts_1.any
    })
]);
const FailureSchema = io_ts_1.interface({
    jsonrpc: io_ts_1.literal("2.0"),
    error: FailureErrorSchema,
    id: io_ts_1.union([io_ts_1.number, io_ts_1.string, io_ts_1.nullType])
});
function Failure(error, id = null) {
    return { jsonrpc: "2.0", error, id };
}
exports.Failure = Failure;
function FailureError(code, message, data) {
    return Object.assign({ code, message }, (data !== undefined ? { data } : {}));
}
exports.FailureError = FailureError;
function FailureErrorFactory(code, defaultMessage) {
    return (data, message = defaultMessage) => FailureError(code, message, data);
}
exports.FailureErrorFactory = FailureErrorFactory;
function isFailure(value) {
    return io_ts_1.validate(value, FailureSchema).fold(_ => false, (_) => true);
}
exports.isFailure = isFailure;
function isFailureError(e) {
    return io_ts_1.validate(e, FailureErrorSchema).fold((_) => false, (_) => true);
}
exports.isFailureError = isFailureError;
function isFailureErrorWithCode(code) {
    return (e) => isFailureError(e) && e.code === code;
}
exports.isFailureErrorWithCode = isFailureErrorWithCode;
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
        return errors.InternalError(errorData);
    }
    return errors.InternalError(error);
}
exports.failureErrorFrom = failureErrorFrom;
