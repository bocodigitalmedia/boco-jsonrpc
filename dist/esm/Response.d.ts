import { Success } from './Success';
import { Failure } from './Failure';
import { Type } from 'io-ts';
import { Either } from 'fp-ts/lib/Either';
import { FailureError } from './FailureError';
export declare type Response<L extends FailureError = FailureError, R = {}> = Failure<L> | Success<R>;
export declare const Response: {
    ioType: Type<Response<FailureError<number, {}>, {}>, Response<FailureError<number, {}>, {}>, string | number | boolean | symbol | object | {
        [key: string]: any;
    } | null | undefined>;
    toEither: <L extends FailureError<number, {}>, R>(response: Response<L, R>) => Either<Failure<L>, Success<R>>;
};
