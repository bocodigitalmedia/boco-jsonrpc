import { Request } from "../request";
export interface FetchClient extends FetchClientOptions {
    url: string;
}
export interface FetchClientOptions {
    replacer?: (key: string, val: any) => any;
    requestInit?: RequestInit;
}
export declare class InvalidResponse extends Error {
    response: Response;
    constructor(response: Response);
}
export declare function FetchClient(url: string, options?: FetchClientOptions): FetchClient;
export declare function isJsonResponse(response: Response): boolean;
export declare function sendRequest(request: Request, {url, replacer, requestInit: {headers: clientHeaders, ...clientInit}}: FetchClient, {headers: requestHeaders, ...requestInit}?: RequestInit): Promise<any>;
