import { Type } from 'io-ts';
export interface Success<T = {}> {
    jsonrpc: '2.0';
    result: T;
    id: string | number;
    error?: never;
}
export declare const Success: (<T>(result: T, id: string | number) => Success<T>) & {
    ioType: Type<Success<{}>, Success<{}>, string | number | boolean | symbol | object | {
        [key: string]: any;
    } | null | undefined>;
};
