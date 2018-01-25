import { FailureError } from "./response/failure";
import { Either } from "fp-ts/lib/Either";
export declare type RequestParams = any[] | object;
export interface Request {
    jsonrpc: "2.0";
    method: string;
    id?: string | number | null;
    params?: RequestParams;
}
export declare function Request(method: string, params?: any[] | object, id?: string | number | null): Request;
export declare function isRequest(a: any): a is Request;
export declare function parseRequest(json: string, msg?: string): Either<FailureError, any>;
export declare function validateRequest(data: any, msg?: string): Either<FailureError, Request>;
