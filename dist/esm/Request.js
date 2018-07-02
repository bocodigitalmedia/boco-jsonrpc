import { tryCatch } from 'fp-ts/lib/Either';
import { failure } from 'io-ts/lib/PathReporter';
import { InvalidRequest } from './InvalidRequest';
import { literal, type, union, string, number, object, intersection, partial, array, any } from 'io-ts';
import { ParseError } from './ParseError';
function RequestConstructor(method, params, id) {
    return { jsonrpc: '2.0', method, params, id };
}
const ioType = intersection([
    type({
        jsonrpc: literal('2.0'),
        method: string
    }),
    partial({
        id: union([string, number]),
        params: union([object, array(any)])
    })
], 'Request');
const validate = (request) => ioType
    .decode(request)
    .mapLeft(errors => InvalidRequest({ request, errors: failure(errors) }));
const parse = (json) => tryCatch(() => JSON.parse(json))
    .mapLeft(e => ParseError({ json, message: e.message }))
    .chain(data => validate(data));
const hasId = (request) => ['string', 'number'].includes(typeof request.id);
export const Request = Object.assign(RequestConstructor, {
    ioType,
    validate,
    hasId,
    parse
});
