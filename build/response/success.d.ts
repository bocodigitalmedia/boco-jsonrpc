export interface Success {
    jsonrpc: "2.0";
    result: any;
    id: string | number | null;
}
export declare function Success(result: any, id?: string | number | null): Success;
export declare function isSuccess(a: any): a is Success;
