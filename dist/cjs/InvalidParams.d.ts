import { FailureError } from './FailureError';
import { Request } from './Request';
export declare type InvalidParams = FailureError<-32602, {
    request: Request;
    errors: string[];
}>;
export declare const InvalidParams: (data: {
    request: Request;
    errors: string[];
}) => FailureError<-32602, {
    request: Request;
    errors: string[];
}>;
