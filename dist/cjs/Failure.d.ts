import { FailureError } from '.';
import { Type } from 'io-ts';
export interface Failure<E extends FailureError = FailureError> {
    jsonrpc: '2.0';
    error: E;
    id?: string | number;
    result?: never;
}
export declare const Failure: (<E extends FailureError<number, {}>>(error: E, id?: string | number | undefined) => Failure<E>) & {
    ioType: Type<Failure<FailureError<number, {}>>, Failure<FailureError<number, {}>>, string | number | boolean | symbol | object | {
        [key: string]: any;
    } | null | undefined>;
};
