import { FailureError } from './FailureError';
export declare type ParseError = FailureError<-32700, {
    json: string;
    message: string;
}>;
export declare const ParseError: (data: {
    json: string;
    message: string;
}) => FailureError<-32700, {
    json: string;
    message: string;
}>;
