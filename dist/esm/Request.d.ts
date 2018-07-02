import { FailureError } from './FailureError';
import { Either } from 'fp-ts/lib/Either';
import { Type } from 'io-ts';
export interface Request {
    jsonrpc: '2.0';
    method: string;
    params?: object | any[];
    id?: string | number;
}
export declare const Request: ((method: string, params: object, id: string | number) => Request) & {
    ioType: Type<Request, Request, string | number | boolean | symbol | object | {
        [key: string]: any;
    } | null | undefined>;
    validate: (request: any) => Either<FailureError<-32600, {
        request: object;
        errors: string[];
    }>, Request>;
    hasId: (request: Request) => request is Request & {
        id: string | number;
    };
    parse: (json: string) => Either<FailureError<-32600, {
        request: object;
        errors: string[];
    }> | FailureError<-32700, {
        json: string;
        message: string;
    }>, Request>;
};
