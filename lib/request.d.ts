import { FailureError } from "./response/failure";
import { Either } from "fp-ts/lib/Either";
export declare type RequestParams = any[] | object;
export declare type JsonReviver = (key: string, value: any) => any;
export interface Request {
    jsonrpc: "2.0";
    method: string;
    id?: string | number | null;
    params?: RequestParams;
}
export declare function Request(method: string, params?: any[] | object, id?: string | number | null): Request;
export declare function isRequest(a: any): a is Request;
export declare function isRequestArray(a: any): a is Request[];
export declare function parseRequest(json: string, reviver?: JsonReviver): Either<FailureError, any>;
export declare function validateRequest(a: any): Either<FailureError, Request | any[]>;
export declare function paramsToArguments(params?: RequestParams): any[];
