export declare type Response = Success | Failure;
export interface Cases<T> {
    success: (a: Success) => T;
    failure: (b: Failure) => T;
}
export declare function caseOf<T>({success, failure}: Cases<T>, response: Response): T;
export declare function isResponse(a: any): a is Response;
export declare function isBatchResponse(a: any): a is Response[];
export interface Success {
    jsonrpc: "2.0";
    result: any;
    id: string | number | null;
}
export declare function Success(result: any, id?: string | number | null): Success;
export declare function isSuccess(a: any): a is Success;
export interface Failure<C extends number = number> {
    jsonrpc: "2.0";
    error: FailureError<C>;
    id: number | string | null;
}
export declare function Failure<C extends number = number>(error: FailureError<C>, id?: number | string | null): Failure<C>;
export declare function isFailure(value: any): value is Failure;
export interface FailureError<C extends number = number> {
    code: C;
    message: string;
    data?: any;
}
export declare function FailureError<C extends number = number>(code: C, message: string, data?: any): FailureError<C>;
export declare function failureErrorFactory<C extends number = number>(code: C, defaultMessage: string): (data?: any, message?: string) => FailureError<C>;
export declare function failureErrorFrom(error: any): FailureError;
export declare function isFailureError(e: any): e is FailureError;
export declare function isFailureErrorWithCode<C extends number = number>(code: C): (e: any) => e is FailureError<C>;
export declare type ParseError = FailureError<typeof PARSE_ERROR>;
export declare type InvalidRequestError = FailureError<typeof INVALID_REQUEST_ERROR>;
export declare type MethodNotFoundError = FailureError<typeof METHOD_NOT_FOUND_ERROR>;
export declare type InvalidParamsError = FailureError<typeof INVALID_PARAMS_ERROR>;
export declare type InternalError = FailureError<typeof INTERNAL_ERROR>;
export declare const PARSE_ERROR = -32700;
export declare const INVALID_REQUEST_ERROR = -32600;
export declare const METHOD_NOT_FOUND_ERROR = -32601;
export declare const INVALID_PARAMS_ERROR = -32602;
export declare const INTERNAL_ERROR = -32603;
export declare const ParseError: (data?: any, message?: string) => FailureError<-32700>;
export declare const InvalidRequestError: (data?: any, message?: string) => FailureError<-32600>;
export declare const MethodNotFoundError: (data?: any, message?: string) => FailureError<-32601>;
export declare const InvalidParamsError: (data?: any, message?: string) => FailureError<-32602>;
export declare const InternalError: (data?: any, message?: string) => FailureError<-32603>;
export declare const isParseError: (e: any) => e is FailureError<-32700>;
export declare const isInvalidRequestError: (e: any) => e is FailureError<-32600>;
export declare const isMethodNotFoundError: (e: any) => e is FailureError<-32601>;
export declare const isInvalidParamsError: (e: any) => e is FailureError<-32602>;
export declare const isInternalError: (e: any) => e is FailureError<-32603>;
