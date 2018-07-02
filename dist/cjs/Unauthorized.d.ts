import { FailureError } from './FailureError';
export declare type Unauthorized = FailureError<-32401, {
    authorization: string | null;
    reason: string;
}>;
export declare const Unauthorized: (data: {
    authorization: string | null;
    reason: string;
}) => FailureError<-32401, {
    authorization: string | null;
    reason: string;
}>;
