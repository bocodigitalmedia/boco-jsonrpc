import { literal, any, string, union, number, strict } from 'io-ts';
const ioType = strict({
    jsonrpc: literal('2.0'),
    result: any,
    id: union([string, number])
});
function SuccessConstructor(result, id) {
    return {
        jsonrpc: '2.0',
        result,
        id
    };
}
export const Success = Object.assign(SuccessConstructor, { ioType });
