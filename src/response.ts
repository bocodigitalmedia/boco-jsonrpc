import {
    Schema,
    validate as schemaValidate,
    SyncValidateFn,
    ValidationFailed
} from '@bocodigitalmedia/jsonschema'

enum ResponseSchemaRef {
    error = '#/definitions/error',
    response = '#/definitions/response',
    success = '#/definitions/success',
    failure = '#/definitions/failure',
    batch = '#/definitions/batch',
    item = '#/definitions/item'
}

export const responseSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id:
        'https://raw.githubusercontent.com/bocodigitalmedia/jsonrpc/master/schema/response.json',
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
}

const validateRef = (ref: ResponseSchemaRef): SyncValidateFn =>
    schemaValidate(
        { $ref: `${responseSchema.$id}${ref}` },
        { schemas: [responseSchema] }
    )

export const responseSchemaValidate = schemaValidate(responseSchema)
export const responseSchemaValidateItem = validateRef(ResponseSchemaRef.item)
export const responseSchemaValidateError = validateRef(ResponseSchemaRef.error)
export const responseSchemaValidateSuccess = validateRef(
    ResponseSchemaRef.success
)
export const responseSchemaValidateFailure = validateRef(
    ResponseSchemaRef.failure
)
export const responseSchemaValidateBatch = validateRef(ResponseSchemaRef.batch)

import { Either } from 'fp-ts/lib/either'

export interface FailureError<C extends number = number> {
    code: C
    message: string
    data?: any
}

export interface Success {
    jsonrpc: '2.0'
    result: any
    id: string | number | null
}

export interface Failure<C extends number = number> {
    jsonrpc: '2.0'
    error: FailureError<C>
    id: number | string | null
}

export type ResponseItem = Success | Failure

export interface ResponseBatch extends Array<ResponseItem> {
    0: ResponseItem
}

export type Response = ResponseItem | ResponseBatch

const eitherToBool = (e: Either<any, any>) => e.fold(_ => false, _ => true)

export class InvalidResponseError extends Error {
    constructor(public data: ValidationFailed['data']) {
        super('Invalid Response')
    }
}

export function validateResponse(
    a: any
): Either<InvalidResponseError, Response> {
    return responseSchemaValidate(a).mapLeft(
        ({ data }) => new InvalidResponseError(data)
    )
}

export function isResponse(a: any): a is Response {
    return eitherToBool(responseSchemaValidate(a))
}

export function isResponseItem(a: any): a is ResponseItem {
    return eitherToBool(responseSchemaValidateItem(a))
}

export function isResponseBatch(a: any): a is ResponseBatch {
    return eitherToBool(responseSchemaValidateBatch(a))
}

export function isSuccess(a: any): a is Success {
    return eitherToBool(responseSchemaValidateSuccess(a))
}

export function isFailure(a: any): a is Failure {
    return eitherToBool(responseSchemaValidateFailure(a))
}

export function isFailureError(a: any): a is FailureError {
    return eitherToBool(responseSchemaValidateError(a))
}

export function Success(
    result: any,
    id: string | number | null = null
): Success {
    return { jsonrpc: '2.0', result, id }
}

export function Failure<C extends number = number>(
    error: FailureError<C>,
    id: number | string | null = null
): Failure<C> {
    return { jsonrpc: '2.0', error, id }
}

export function FailureError<C extends number = number>(
    code: C,
    message: string,
    data?: any
): FailureError<C> {
    return { code, message, ...(data !== undefined ? { data } : {}) }
}

export function failureErrorFactory<C extends number = number>(
    code: C,
    defaultMessage: string
) {
    return (data?: any, message: string = defaultMessage) =>
        FailureError(code, message, data)
}

export function failureErrorFrom(error: any): FailureError {
    if (isFailureError(error)) {
        return FailureError(error.code, error.message, error.data)
    }

    if (typeof error === 'object' && error.stack) {
        const errorData = Object.getOwnPropertyNames(error)
            .filter(k => k !== 'stack')
            .reduce((memo, key) => ({ ...memo, [key]: error[key] }), {
                name: error.name
            })

        return InternalError(errorData)
    }

    return InternalError(error)
}

export function isFailureErrorWithCode<C extends number = number>(code: C) {
    return (e: any): e is FailureError<C> =>
        isFailureError(e) && e.code === code
}

// ----------------------------------------------------------------------------
// Defined Failure Errors
// ----------------------------------------------------------------------------

export type ParseError = FailureError<typeof PARSE_ERROR>
export type InvalidRequestError = FailureError<typeof INVALID_REQUEST_ERROR>
export type MethodNotFoundError = FailureError<typeof METHOD_NOT_FOUND_ERROR>
export type InvalidParamsError = FailureError<typeof INVALID_PARAMS_ERROR>
export type InternalError = FailureError<typeof INTERNAL_ERROR>

export const PARSE_ERROR = -32700
export const INVALID_REQUEST_ERROR = -32600
export const METHOD_NOT_FOUND_ERROR = -32601
export const INVALID_PARAMS_ERROR = -32602
export const INTERNAL_ERROR = -32603

export const ParseError = failureErrorFactory(PARSE_ERROR, 'Parse error')

export const InvalidRequestError = failureErrorFactory(
    INVALID_REQUEST_ERROR,
    'Invalid request'
)
export const MethodNotFoundError = failureErrorFactory(
    METHOD_NOT_FOUND_ERROR,
    'Method not found'
)
export const InvalidParamsError = failureErrorFactory(
    INVALID_PARAMS_ERROR,
    'Invalid params'
)
export const InternalError = failureErrorFactory(
    INTERNAL_ERROR,
    'Internal error'
)

export const isParseError = isFailureErrorWithCode(PARSE_ERROR)

export const isInvalidRequestError = isFailureErrorWithCode(
    INVALID_REQUEST_ERROR
)

export const isMethodNotFoundError = isFailureErrorWithCode(
    METHOD_NOT_FOUND_ERROR
)

export const isInvalidParamsError = isFailureErrorWithCode(INVALID_PARAMS_ERROR)

export const isInternalError = isFailureErrorWithCode(INTERNAL_ERROR)
