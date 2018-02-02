import { Request, RequestParams, JsonReviver } from "./request";
import { Response } from "./response";
export interface Methods {
    [key: string]: Function;
}
export declare type TransformErrorFn = (error: any) => any;
export declare type ParamsToArgsFn = (method: string, params?: RequestParams) => any[];
export interface Service extends ServiceOptions {
    methods: Methods;
}
export interface ServiceOptions {
    transformError: TransformErrorFn;
    paramsToArgs: ParamsToArgsFn;
}
export declare function Service(methods: Methods, {transformError, paramsToArgs}?: Partial<ServiceOptions>): Service;
export declare function receiveRequest({method, params, id}: Request, {transformError, paramsToArgs, methods}: Service): Promise<Response | void>;
export declare function receiveRequests(requests: Request[], service: Service): Promise<Response[] | void>;
export declare function receiveData(data: any, service: Service): Promise<Response | Response[] | void>;
export declare function receiveJson(json: string, service: Service, reviver?: JsonReviver): Promise<Response | Response[] | void>;
