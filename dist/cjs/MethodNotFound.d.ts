import { FailureError } from './FailureError';
import { Request } from './Request';
export declare type MethodNotFound = FailureError<-32601, {
    request: Request;
}>;
export declare const MethodNotFound: (data: {
    request: Request;
}) => FailureError<-32601, {
    request: Request;
}>;
