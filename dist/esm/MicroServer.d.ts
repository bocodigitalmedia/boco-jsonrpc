/// <reference types="node" />
import { IncomingMessage } from 'http';
import { Request } from './Request';
import { Failure } from './Failure';
import { Success } from './Success';
import { Response } from './Response';
import { Option } from 'fp-ts/lib/Option';
import { FailureError } from './FailureError';
import { Task } from 'fp-ts/lib/Task';
import { MicroRequestHandler } from './MicroRequestHandler';
export declare const MicroServer: {
    handleRequest: <L extends FailureError<number, {}>, R>(task: MicroRequestHandler<L, R>, options?: {
        limit?: string | undefined;
        encoding?: string | undefined;
    }) => (message: IncomingMessage) => Promise<Failure<FailureError<-32600, {
        request: object;
        errors: string[];
    }> | FailureError<-32700, {
        json: string;
        message: string;
    }> | FailureError<-32603, {
        request?: Request | undefined;
        cause: any;
    }> | FailureError<-32602, {
        request: Request;
        errors: string[];
    }> | FailureError<-32601, {
        request: Request;
    }> | FailureError<-32401, {
        authorization: string | null;
        reason: string;
    }> | L> | Success<R> | null>;
    getOption: <L extends FailureError<number, {}>, R>(task: MicroRequestHandler<L, R>) => (json: string, message: IncomingMessage) => Task<Option<Response<FailureError<-32600, {
        request: object;
        errors: string[];
    }> | FailureError<-32700, {
        json: string;
        message: string;
    }> | FailureError<-32603, {
        request?: Request | undefined;
        cause: any;
    }> | FailureError<-32602, {
        request: Request;
        errors: string[];
    }> | FailureError<-32601, {
        request: Request;
    }> | FailureError<-32401, {
        authorization: string | null;
        reason: string;
    }> | L, R>>>;
    contentTypePattern: RegExp;
};
