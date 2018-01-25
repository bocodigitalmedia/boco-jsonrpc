import * as errors from "./failure/errors";
export { errors };
export interface FailureError<C extends number = number> {
    code: C;
    message: string;
    data?: any;
}
export interface Failure {
    jsonrpc: "2.0";
    error: FailureError;
    id: number | string | null;
}
export declare function Failure(error: FailureError, id?: number | string | null): Failure;
export declare function FailureError<C extends number = number>(code: C, message: string, data?: any): FailureError<C>;
export declare function FailureErrorFactory<C extends number = number>(code: C, defaultMessage: string): (data?: any, message?: string) => FailureError<C>;
export declare function isFailure(value: any): value is Failure;
export declare function isFailureError(e: any): e is FailureError;
export declare function isFailureErrorWithCode<C extends number = number>(code: C): (e: any) => e is FailureError<C>;
export declare function failureErrorFrom(error: any): FailureError;
