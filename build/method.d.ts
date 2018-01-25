import { InvalidParams } from "./response/failure/errors";
import { Either } from "fp-ts/lib/Either";
import { RequestParams } from "./request";
export declare type PassFn = (args: any[]) => Either<InvalidParams, any[]>;
export declare type FailFn = (data?: any, message?: string) => Either<InvalidParams, any[]>;
export declare type ValidateParamsFn = (params: RequestParams | undefined, pass: PassFn, fail: FailFn) => Either<InvalidParams, any[]>;
export interface Method {
    validateParams: ValidateParamsFn;
    exec: Function;
}
export declare function Method(exec: Function, validateParams?: ValidateParamsFn): Method;
export declare const validateParamsFn: ValidateParamsFn;
export declare function apply({validateParams, exec}: Method, params?: RequestParams): Promise<any>;
