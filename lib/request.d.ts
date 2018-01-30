import { FailureError } from "./response";
import { Either } from "fp-ts/lib/Either";
export declare type JsonReviver = (key: string, value: any) => any;
export declare type RequestParams = any[] | object;
export interface BatchRequest extends Array<Request> {
    0: Request;
}
export interface Request {
    jsonrpc: "2.0";
    method: string;
    params?: RequestParams;
    id?: string | number;
}
export interface Notification extends Request {
    id?: never;
}
export declare function Request(method: string, params?: any[] | object, id?: string | number): Request;
export declare function isRequest(a: any): a is Request;
export declare function isNotification(a: any): a is Notification;
export declare function isBatchRequest(a: any): a is BatchRequest;
export declare function parseRequest(json: string, reviver?: JsonReviver): Either<FailureError, any>;
export declare function validateRequest(a: any): Either<FailureError, Request | any[]>;
export declare function paramsToArgs(params?: RequestParams): any[];
