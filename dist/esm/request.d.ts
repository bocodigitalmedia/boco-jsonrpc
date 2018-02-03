import { Schema, SyncValidateFn } from '@bocodigitalmedia/jsonschema';
import { FailureError } from './response';
import { Either } from 'fp-ts/lib/Either';
export declare type JsonReviver = (key: string, value: any) => any;
export declare type RequestParams = any[] | object;
export declare type Request = RequestItem | RequestBatch;
export interface RequestBatch extends Array<RequestItem> {
    0: RequestItem;
}
export interface RequestItem {
    jsonrpc: '2.0';
    method: string;
    params?: RequestParams;
    id?: string | number;
}
export interface Notification extends RequestItem {
    id?: never;
}
export declare enum RequestSchemaRef {
    item = "#/definitions/item",
    batch = "#/definitions/batch",
}
export declare const requestSchema: Schema;
export declare const requestSchemaValidate: SyncValidateFn;
export declare const requestSchemaValidateBatch: SyncValidateFn;
export declare const requestSchemaValidateItem: SyncValidateFn;
export declare function RequestItem(method: string, params?: any[] | object, id?: string | number): RequestItem;
export declare function isRequest(a: any): a is Request;
export declare function isRequestItem(a: any): a is RequestItem;
export declare function isRequestBatch(a: any): a is RequestBatch;
export declare function isNotification(a: any): a is Notification;
export declare function parseRequest(json: string, reviver?: JsonReviver): Either<FailureError, any>;
export declare function validateRequest(a: any): Either<FailureError, Request>;
export declare function requestParamsToArgs(params?: RequestParams): any[];
