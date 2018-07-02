import { FailureError } from './FailureError';
export declare type InvalidRequest = FailureError<-32600, {
    request: object;
    errors: string[];
}>;
export declare const InvalidRequest: (data: {
    request: object;
    errors: string[];
}) => FailureError<-32600, {
    request: object;
    errors: string[];
}>;
