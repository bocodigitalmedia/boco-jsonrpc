"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const micro_1 = require("micro");
const Request_1 = require("./Request");
const Failure_1 = require("./Failure");
const Success_1 = require("./Success");
const TaskEither_1 = require("fp-ts/lib/TaskEither");
const Option_1 = require("fp-ts/lib/Option");
const contentTypePattern = /^application\/json(-rpc|request)?$/i;
const getOption = (task) => (json, message) => TaskEither_1.fromEither(Request_1.Request.parse(json))
    .mapLeft(error => Option_1.some(Failure_1.Failure(error)))
    .chain(request => task(request, message).bimap(error => (request.id ? Option_1.some(Failure_1.Failure(error, request.id)) : Option_1.none), result => request.id ? Option_1.some(Success_1.Success(result, request.id)) : Option_1.none))
    .fold(e => e, r => r);
const handleRequest = (task, options = {
    limit: '1k',
    encoding: 'utf8'
}) => async (message) => {
    const contentType = message.headers['content-type'] || '';
    const accept = message.headers['accept'] || '';
    if (!contentTypePattern.test(contentType))
        throw micro_1.createError(415, 'Unsupported Media Type');
    if (!contentTypePattern.test(accept))
        throw micro_1.createError(406, 'Not acceptable');
    const json = await micro_1.text(message, options);
    return getOption(task)(json, message)
        .map(option => option.toNullable())
        .run();
};
exports.MicroServer = {
    handleRequest,
    getOption,
    contentTypePattern
};
