import {
    Schema,
    validate as schemaValidate,
    SyncValidateFn
} from '@bocodigitalmedia/jsonschema'

import { FailureError, ParseError, InvalidRequestError } from './response'
import { Either, tryCatch } from 'fp-ts/lib/Either'

export type JsonReviver = (key: string, value: any) => any

export type RequestParams = any[] | object

export type Request = RequestItem | RequestBatch

export interface RequestBatch extends Array<RequestItem> {
    0: RequestItem
}

export interface RequestItem {
    jsonrpc: '2.0'
    method: string
    params?: RequestParams
    id?: string | number
}

export interface Notification extends RequestItem {
    id?: never
}

export enum RequestSchemaRef {
    item = '#/definitions/item',
    batch = '#/definitions/batch'
}

export const requestSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id:
        'https://raw.githubusercontent.com/bocodigitalmedia/jsonrpc/master/schema/request.json',
    description: 'A JSON RPC 2.0 request',
    oneOf: [{ $ref: RequestSchemaRef.item }, { $ref: RequestSchemaRef.batch }],
    definitions: {
        item: {
            type: 'object',
            required: ['jsonrpc', 'method'],
            additionalProperties: false,
            properties: {
                jsonrpc: { const: '2.0' },
                method: { type: 'string' },
                id: { type: ['string', 'number', 'null'] },
                params: { type: ['array', 'object'] }
            }
        },
        batch: {
            type: 'array',
            minItems: 1,
            items: { $ref: RequestSchemaRef.item }
        }
    }
}

const schemaValidateRef = (ref: RequestSchemaRef): SyncValidateFn =>
    schemaValidate(
        { $ref: `${requestSchema.$id}${ref}` },
        { schemas: [requestSchema] }
    )

export const requestSchemaValidate = schemaValidate(requestSchema)

export const requestSchemaValidateBatch = schemaValidateRef(
    RequestSchemaRef.batch
)
export const requestSchemaValidateItem = schemaValidateRef(
    RequestSchemaRef.item
)

export function RequestItem(
    method: string,
    params?: any[] | object,
    id?: string | number
): RequestItem {
    return {
        jsonrpc: '2.0',
        method,
        ...(params !== undefined ? { params } : {}),
        ...(id !== undefined ? { id } : {})
    }
}

const eitherToBool = (e: Either<any, any>) => e.fold(_ => false, _ => true)

export function isRequest(a: any): a is Request {
    return eitherToBool(requestSchemaValidate(a))
}

export function isRequestItem(a: any): a is RequestItem {
    return eitherToBool(requestSchemaValidateItem(a))
}

export function isRequestBatch(a: any): a is RequestBatch {
    return eitherToBool(requestSchemaValidateBatch(a))
}

export function isNotification(a: any): a is Notification {
    return isRequestItem(a) && a.id === undefined
}

export function parseRequest(
    json: string,
    reviver?: JsonReviver
): Either<FailureError, any> {
    return tryCatch(() => JSON.parse(json, reviver)).mapLeft(
        ({ name, message }) => ParseError({ name, message })
    )
}

export function validateRequest(a: any): Either<FailureError, Request> {
    return requestSchemaValidate(a).mapLeft(({ data }) =>
        InvalidRequestError(data)
    )
}

export function requestParamsToArgs(params: RequestParams = []): any[] {
    return Array.isArray(params) ? params : [params]
}
