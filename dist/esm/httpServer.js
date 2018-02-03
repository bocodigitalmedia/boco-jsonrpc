import { isFailure, isMethodNotFoundError, isInvalidRequestError } from './response';
import { createGunzip, createInflate } from 'zlib';
import { receiveRequestJson } from './server';
import * as createError from 'http-errors';
import * as getRawBody from 'raw-body';
const DEFAULT_LIMIT = '150kb';
function getEncoding(req) {
    return req.headers['content-encoding'] || 'identity';
}
function getContentLength(req) {
    return req.headers['content-length'] || undefined;
}
function getBodyStream(req) {
    return new Promise((resolve, reject) => {
        const encoding = getEncoding(req);
        switch (encoding) {
            case 'deflate': {
                resolve(req.pipe(createInflate()));
                break;
            }
            case 'gzip': {
                resolve(req.pipe(createGunzip()));
                break;
            }
            case 'identity': {
                resolve(req);
                break;
            }
            default: {
                reject(createError(415, `unsupported content encoding "${encoding}"`, {
                    encoding: encoding,
                    type: 'encoding.unsupported'
                }));
            }
        }
    });
}
function getBody(req, { limit } = {}) {
    const isIdentity = getEncoding(req) === 'identity';
    const length = getContentLength(req);
    const getRawBodyOptions = isIdentity && length !== undefined
        ? { limit, length, encoding: 'utf-8' }
        : { limit, encoding: 'utf-8' };
    return getBodyStream(req).then(stream => getRawBody(stream, getRawBodyOptions));
}
function getJson(req, options) {
    const pattern = /^application\/(json|json-rpc|jsonrequest)(;.+)?$/i;
    const type = req.headers['content-type'] || '';
    if (!pattern.test(type)) {
        return Promise.reject(createError(415, `unsupported content-type: "${type}"`, {
            contentType: type,
            type: 'content_type.unsupported'
        }));
    }
    return getBody(req, options);
}
export function createPostRoute(server, { limit = DEFAULT_LIMIT, replacer } = {}) {
    return function (req, res, next) {
        getJson(req, { limit })
            .then((json) => receiveRequestJson(json, server))
            .then(response => {
            const json = (code, response) => {
                res.writeHead(code, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(response, replacer));
                res.end();
            };
            if (response === undefined) {
                res.writeHead(204);
                return res.end();
            }
            if (isFailure(response) &&
                isMethodNotFoundError(response.error)) {
                return json(404, response);
            }
            if (isFailure(response) &&
                isInvalidRequestError(response.error)) {
                return json(400, response);
            }
            return json(200, response);
        })
            .catch(next);
    };
}
