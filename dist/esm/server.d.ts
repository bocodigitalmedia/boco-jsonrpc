import { Request, RequestItem, RequestBatch, RequestParams, JsonReviver } from './request';
import { Response, ResponseItem, ResponseBatch } from './response';
export interface Methods {
    [key: string]: Function;
}
export declare type TransformErrorFn = (error: any) => any;
export declare type ParamsToArgsFn = (method: string, params?: RequestParams) => any[];
export interface Server extends ServiceOptions {
    methods: Methods;
}
export interface ServiceOptions {
    transformError: TransformErrorFn;
    paramsToArgs: ParamsToArgsFn;
}
export declare function Server(methods: Methods, {transformError, paramsToArgs}?: Partial<ServiceOptions>): Server;
export declare function receiveRequestItem({method, params, id}: RequestItem, {transformError, paramsToArgs, methods}: Server): Promise<ResponseItem | void>;
export declare function receiveRequestBatch(requests: RequestBatch, service: Server): Promise<ResponseBatch | void>;
export declare function receiveRequest(request: Request, service: Server): Promise<Response | void>;
export declare function receiveRequestData(data: any, service: Server): Promise<Response | void>;
export declare function receiveRequestJson(json: string, service: Server, reviver?: JsonReviver): Promise<Response | void>;
