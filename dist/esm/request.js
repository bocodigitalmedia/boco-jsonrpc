import { validate as schemaValidate } from '@bocodigitalmedia/jsonschema';
import { ParseError, InvalidRequestError } from './response';
import { tryCatch } from 'fp-ts/lib/Either';
export var RequestSchemaRef;
(function (RequestSchemaRef) {
    RequestSchemaRef["item"] = "#/definitions/item";
    RequestSchemaRef["batch"] = "#/definitions/batch";
})(RequestSchemaRef || (RequestSchemaRef = {}));
export const requestSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://raw.githubusercontent.com/bocodigitalmedia/jsonrpc/master/schema/request.json',
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
};
const schemaValidateRef = (ref) => schemaValidate({ $ref: `${requestSchema.$id}${ref}` }, { schemas: [requestSchema] });
export const requestSchemaValidate = schemaValidate(requestSchema);
export const requestSchemaValidateBatch = schemaValidateRef(RequestSchemaRef.batch);
export const requestSchemaValidateItem = schemaValidateRef(RequestSchemaRef.item);
export function RequestItem(method, params, id) {
    return Object.assign({ jsonrpc: '2.0', method }, (params !== undefined ? { params } : {}), (id !== undefined ? { id } : {}));
}
const eitherToBool = (e) => e.fold(_ => false, _ => true);
export function isRequest(a) {
    return eitherToBool(requestSchemaValidate(a));
}
export function isRequestItem(a) {
    return eitherToBool(requestSchemaValidateItem(a));
}
export function isRequestBatch(a) {
    return eitherToBool(requestSchemaValidateBatch(a));
}
export function isNotification(a) {
    return isRequestItem(a) && a.id === undefined;
}
export function parseRequest(json, reviver) {
    return tryCatch(() => JSON.parse(json, reviver)).mapLeft(({ name, message }) => ParseError({ name, message }));
}
export function validateRequest(a) {
    return requestSchemaValidate(a).mapLeft(({ data }) => InvalidRequestError(data));
}
export function requestParamsToArgs(params = []) {
    return Array.isArray(params) ? params : [params];
}
