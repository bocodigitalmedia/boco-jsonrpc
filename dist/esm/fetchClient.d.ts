import { RequestItem, RequestBatch } from './request';
import { ResponseItem, ResponseBatch } from './response';
export interface FetchClient extends FetchClientOptions {
    url: string;
}
export interface FetchClientOptions {
    replacer?: (key: string, val: any) => any;
    requestInit?: RequestInit;
}
export declare class InvalidJsonRpcResponse extends Error {
    response: any;
    constructor(response: any);
}
export declare function FetchClient(url: string, options?: FetchClientOptions): FetchClient;
export declare function fetchClientRequest(request: RequestItem, client: FetchClient, init?: RequestInit): Promise<ResponseItem | void>;
export declare function fetchClientRequest(request: RequestBatch, client: FetchClient, init?: RequestInit): Promise<ResponseBatch | void>;
