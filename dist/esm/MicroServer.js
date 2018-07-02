import { text, createError } from 'micro';
import { Request } from './Request';
import { Failure } from './Failure';
import { Success } from './Success';
import { fromEither } from 'fp-ts/lib/TaskEither';
import { some, none } from 'fp-ts/lib/Option';
const contentTypePattern = /^application\/json(-rpc|request)?$/i;
const getOption = (task) => (json, message) => fromEither(Request.parse(json))
    .mapLeft(error => some(Failure(error)))
    .chain(request => task(request, message).bimap(error => (request.id ? some(Failure(error, request.id)) : none), result => request.id ? some(Success(result, request.id)) : none))
    .fold(e => e, r => r);
const handleRequest = (task, options = {
    limit: '1k',
    encoding: 'utf8'
}) => async (message) => {
    const contentType = message.headers['content-type'] || '';
    const accept = message.headers['accept'] || '';
    if (!contentTypePattern.test(contentType))
        throw createError(415, 'Unsupported Media Type');
    if (!contentTypePattern.test(accept))
        throw createError(406, 'Not acceptable');
    const json = await text(message, options);
    return getOption(task)(json, message)
        .map(option => option.toNullable())
        .run();
};
export const MicroServer = {
    handleRequest,
    getOption,
    contentTypePattern
};
