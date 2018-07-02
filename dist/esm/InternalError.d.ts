import { FailureError } from './FailureError';
import { Request } from './Request';
export declare type InternalError = FailureError<-32603, {
    request?: Request;
    cause: any;
}>;
export declare const InternalError: (data: {
    request?: Request | undefined;
    cause: any;
}) => FailureError<-32603, {
    request?: Request | undefined;
    cause: any;
}>;
