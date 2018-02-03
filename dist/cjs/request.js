"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonschema_1 = require("@bocodigitalmedia/jsonschema");
const response_1 = require("./response");
const Either_1 = require("fp-ts/lib/Either");
var RequestSchemaRef;
(function (RequestSchemaRef) {
    RequestSchemaRef["item"] = "#/definitions/item";
    RequestSchemaRef["batch"] = "#/definitions/batch";
})(RequestSchemaRef = exports.RequestSchemaRef || (exports.RequestSchemaRef = {}));
exports.requestSchema = {
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
const schemaValidateRef = (ref) => jsonschema_1.validate({ $ref: `${exports.requestSchema.$id}${ref}` }, { schemas: [exports.requestSchema] });
exports.requestSchemaValidate = jsonschema_1.validate(exports.requestSchema);
exports.requestSchemaValidateBatch = schemaValidateRef(RequestSchemaRef.batch);
exports.requestSchemaValidateItem = schemaValidateRef(RequestSchemaRef.item);
function RequestItem(method, params, id) {
    return Object.assign({ jsonrpc: '2.0', method }, (params !== undefined ? { params } : {}), (id !== undefined ? { id } : {}));
}
exports.RequestItem = RequestItem;
const eitherToBool = (e) => e.fold(_ => false, _ => true);
function isRequest(a) {
    return eitherToBool(exports.requestSchemaValidate(a));
}
exports.isRequest = isRequest;
function isRequestItem(a) {
    return eitherToBool(exports.requestSchemaValidateItem(a));
}
exports.isRequestItem = isRequestItem;
function isRequestBatch(a) {
    return eitherToBool(exports.requestSchemaValidateBatch(a));
}
exports.isRequestBatch = isRequestBatch;
function isNotification(a) {
    return isRequestItem(a) && a.id === undefined;
}
exports.isNotification = isNotification;
function parseRequest(json, reviver) {
    return Either_1.tryCatch(() => JSON.parse(json, reviver)).mapLeft(({ name, message }) => response_1.ParseError({ name, message }));
}
exports.parseRequest = parseRequest;
function validateRequest(a) {
    return exports.requestSchemaValidate(a).mapLeft(({ data }) => response_1.InvalidRequestError(data));
}
exports.validateRequest = validateRequest;
function requestParamsToArgs(params = []) {
    return Array.isArray(params) ? params : [params];
}
exports.requestParamsToArgs = requestParamsToArgs;
