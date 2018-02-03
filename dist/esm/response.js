import { validate as schemaValidate } from '@bocodigitalmedia/jsonschema';
var ResponseSchemaRef;
(function (ResponseSchemaRef) {
    ResponseSchemaRef["error"] = "#/definitions/error";
    ResponseSchemaRef["response"] = "#/definitions/response";
    ResponseSchemaRef["success"] = "#/definitions/success";
    ResponseSchemaRef["failure"] = "#/definitions/failure";
    ResponseSchemaRef["batch"] = "#/definitions/batch";
    ResponseSchemaRef["item"] = "#/definitions/item";
})(ResponseSchemaRef || (ResponseSchemaRef = {}));
export const responseSchema = {
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
const validateRef = (ref) => schemaValidate({ $ref: `${responseSchema.$id}${ref}` }, { schemas: [responseSchema] });
export const responseSchemaValidate = schemaValidate(responseSchema);
export const responseSchemaValidateItem = validateRef(ResponseSchemaRef.item);
export const responseSchemaValidateError = validateRef(ResponseSchemaRef.error);
export const responseSchemaValidateSuccess = validateRef(ResponseSchemaRef.success);
export const responseSchemaValidateFailure = validateRef(ResponseSchemaRef.failure);
export const responseSchemaValidateBatch = validateRef(ResponseSchemaRef.batch);
const eitherToBool = (e) => e.fold(_ => false, _ => true);
export class InvalidResponseError extends Error {
    constructor(data) {
        super('Invalid Response');
        this.data = data;
    }
}
export function validateResponse(a) {
    return responseSchemaValidate(a).mapLeft(({ data }) => new InvalidResponseError(data));
}
export function isResponse(a) {
    return eitherToBool(responseSchemaValidate(a));
}
export function isResponseItem(a) {
    return eitherToBool(responseSchemaValidateItem(a));
}
export function isResponseBatch(a) {
    return eitherToBool(responseSchemaValidateBatch(a));
}
export function isSuccess(a) {
    return eitherToBool(responseSchemaValidateSuccess(a));
}
export function isFailure(a) {
    return eitherToBool(responseSchemaValidateFailure(a));
}
export function isFailureError(a) {
    return eitherToBool(responseSchemaValidateError(a));
}
export function Success(result, id = null) {
    return { jsonrpc: '2.0', result, id };
}
export function Failure(error, id = null) {
    return { jsonrpc: '2.0', error, id };
}
export function FailureError(code, message, data) {
    return Object.assign({ code, message }, (data !== undefined ? { data } : {}));
}
export function failureErrorFactory(code, defaultMessage) {
    return (data, message = defaultMessage) => FailureError(code, message, data);
}
export function failureErrorFrom(error) {
    if (isFailureError(error)) {
        return FailureError(error.code, error.message, error.data);
    }
    if (typeof error === 'object' && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== 'stack')
            .reduce((memo, key) => (Object.assign({}, memo, { [key]: error[key] })), {
            name: error.name
        });
        return InternalError(errorData);
    }
    return InternalError(error);
}
export function isFailureErrorWithCode(code) {
    return (e) => isFailureError(e) && e.code === code;
}
export const PARSE_ERROR = -32700;
export const INVALID_REQUEST_ERROR = -32600;
export const METHOD_NOT_FOUND_ERROR = -32601;
export const INVALID_PARAMS_ERROR = -32602;
export const INTERNAL_ERROR = -32603;
export const ParseError = failureErrorFactory(PARSE_ERROR, 'Parse error');
export const InvalidRequestError = failureErrorFactory(INVALID_REQUEST_ERROR, 'Invalid request');
export const MethodNotFoundError = failureErrorFactory(METHOD_NOT_FOUND_ERROR, 'Method not found');
export const InvalidParamsError = failureErrorFactory(INVALID_PARAMS_ERROR, 'Invalid params');
export const InternalError = failureErrorFactory(INTERNAL_ERROR, 'Internal error');
export const isParseError = isFailureErrorWithCode(PARSE_ERROR);
export const isInvalidRequestError = isFailureErrorWithCode(INVALID_REQUEST_ERROR);
export const isMethodNotFoundError = isFailureErrorWithCode(METHOD_NOT_FOUND_ERROR);
export const isInvalidParamsError = isFailureErrorWithCode(INVALID_PARAMS_ERROR);
export const isInternalError = isFailureErrorWithCode(INTERNAL_ERROR);
