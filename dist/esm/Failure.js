import { intersection, partial, any, string, number, literal, union, type } from 'io-ts';
function FailureConstructor(error, id) {
    return { jsonrpc: '2.0', error, id };
}
const ioType = intersection([
    type({
        jsonrpc: literal('2.0'),
        error: any
    }),
    partial({
        id: union([string, number])
    })
]);
export const Failure = Object.assign(FailureConstructor, { ioType });
