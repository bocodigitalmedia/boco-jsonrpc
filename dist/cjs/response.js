"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonschema_1 = require("@bocodigitalmedia/jsonschema");
var ResponseSchemaRef;
(function (ResponseSchemaRef) {
    ResponseSchemaRef["error"] = "#/definitions/error";
    ResponseSchemaRef["response"] = "#/definitions/response";
    ResponseSchemaRef["success"] = "#/definitions/success";
    ResponseSchemaRef["failure"] = "#/definitions/failure";
    ResponseSchemaRef["batch"] = "#/definitions/batch";
    ResponseSchemaRef["item"] = "#/definitions/item";
})(ResponseSchemaRef || (ResponseSchemaRef = {}));
exports.responseSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://raw.githubusercontent.com/bocodigitalmedia/jsonrpc/master/schema/response.json',
    description: 'A JSON RPC 2.0 response',
    oneOf: [
        { $ref: ResponseSchemaRef.item },
        { $ref: ResponseSchemaRef.batch }
    ],
    definitions: {
        error: {
            description: 'Description of a failure error',
            type: 'object',
            required: ['code', 'message'],
            additionalProperties: false,
            properties: {
                code: { type: 'integer' },
                message: { type: 'string' },
                data: true
            }
        },
        success: {
            description: 'A response indicating success',
            type: 'object',
            required: ['jsonrpc', 'result', 'id'],
            additionalProperties: false,
            properties: {
                jsonrpc: { const: '2.0' },
                result: true,
                id: { type: ['string', 'number', 'null'] }
            }
        },
        failure: {
            description: 'A response indicating failure',
            type: 'object',
            required: ['jsonrpc', 'id', 'error'],
            additionalProperties: false,
            properties: {
                jsonrpc: { const: '2.0' },
                error: { $ref: ResponseSchemaRef.error },
                id: { type: ['string', 'number', 'null'] }
            }
        },
        item: {
            description: 'A response indicating success or failure',
            oneOf: [
                { $ref: ResponseSchemaRef.success },
                { $ref: ResponseSchemaRef.failure }
            ]
        },
        batch: {
            description: 'An array of responses',
            type: 'array',
            minItems: 1,
            additionalItems: false,
            items: { $ref: ResponseSchemaRef.item }
        }
    }
};
const validateRef = (ref) => jsonschema_1.validate({ $ref: `${exports.responseSchema.$id}${ref}` }, { schemas: [exports.responseSchema] });
exports.responseSchemaValidate = jsonschema_1.validate(exports.responseSchema);
exports.responseSchemaValidateItem = validateRef(ResponseSchemaRef.item);
exports.responseSchemaValidateError = validateRef(ResponseSchemaRef.error);
exports.responseSchemaValidateSuccess = validateRef(ResponseSchemaRef.success);
exports.responseSchemaValidateFailure = validateRef(ResponseSchemaRef.failure);
exports.responseSchemaValidateBatch = validateRef(ResponseSchemaRef.batch);
const eitherToBool = (e) => e.fold(_ => false, _ => true);
class InvalidResponseError extends Error {
    constructor(data) {
        super('Invalid Response');
        this.data = data;
    }
}
exports.InvalidResponseError = InvalidResponseError;
function validateResponse(a) {
    return exports.responseSchemaValidate(a).mapLeft(({ data }) => new InvalidResponseError(data));
}
exports.validateResponse = validateResponse;
function isResponse(a) {
    return eitherToBool(exports.responseSchemaValidate(a));
}
exports.isResponse = isResponse;
function isResponseItem(a) {
    return eitherToBool(exports.responseSchemaValidateItem(a));
}
exports.isResponseItem = isResponseItem;
function isResponseBatch(a) {
    return eitherToBool(exports.responseSchemaValidateBatch(a));
}
exports.isResponseBatch = isResponseBatch;
function isSuccess(a) {
    return eitherToBool(exports.responseSchemaValidateSuccess(a));
}
exports.isSuccess = isSuccess;
function isFailure(a) {
    return eitherToBool(exports.responseSchemaValidateFailure(a));
}
exports.isFailure = isFailure;
function isFailureError(a) {
    return eitherToBool(exports.responseSchemaValidateError(a));
}
exports.isFailureError = isFailureError;
function Success(result, id = null) {
    return { jsonrpc: '2.0', result, id };
}
exports.Success = Success;
function Failure(error, id = null) {
    return { jsonrpc: '2.0', error, id };
}
exports.Failure = Failure;
function FailureError(code, message, data) {
    return Object.assign({ code, message }, (data !== undefined ? { data } : {}));
}
exports.FailureError = FailureError;
function failureErrorFactory(code, defaultMessage) {
    return (data, message = defaultMessage) => FailureError(code, message, data);
}
exports.failureErrorFactory = failureErrorFactory;
function failureErrorFrom(error) {
    if (isFailureError(error)) {
        return FailureError(error.code, error.message, error.data);
    }
    if (typeof error === 'object' && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== 'stack')
            .reduce((memo, key) => (Object.assign({}, memo, { [key]: error[key] })), {
            name: error.name
        });
        return exports.InternalError(errorData);
    }
    return exports.InternalError(error);
}
exports.failureErrorFrom = failureErrorFrom;
function isFailureErrorWithCode(code) {
    return (e) => isFailureError(e) && e.code === code;
}
exports.isFailureErrorWithCode = isFailureErrorWithCode;
exports.PARSE_ERROR = -32700;
exports.INVALID_REQUEST_ERROR = -32600;
exports.METHOD_NOT_FOUND_ERROR = -32601;
exports.INVALID_PARAMS_ERROR = -32602;
exports.INTERNAL_ERROR = -32603;
exports.ParseError = failureErrorFactory(exports.PARSE_ERROR, 'Parse error');
exports.InvalidRequestError = failureErrorFactory(exports.INVALID_REQUEST_ERROR, 'Invalid request');
exports.MethodNotFoundError = failureErrorFactory(exports.METHOD_NOT_FOUND_ERROR, 'Method not found');
exports.InvalidParamsError = failureErrorFactory(exports.INVALID_PARAMS_ERROR, 'Invalid params');
exports.InternalError = failureErrorFactory(exports.INTERNAL_ERROR, 'Internal error');
exports.isParseError = isFailureErrorWithCode(exports.PARSE_ERROR);
exports.isInvalidRequestError = isFailureErrorWithCode(exports.INVALID_REQUEST_ERROR);
exports.isMethodNotFoundError = isFailureErrorWithCode(exports.METHOD_NOT_FOUND_ERROR);
exports.isInvalidParamsError = isFailureErrorWithCode(exports.INVALID_PARAMS_ERROR);
exports.isInternalError = isFailureErrorWithCode(exports.INTERNAL_ERROR);
