"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = require("zlib");
const createError = require("http-errors");
const getRawBody = require("raw-body");
const service_1 = require("./service");
const request_1 = require("./request");
const failure_1 = require("./response/failure");
const error_1 = require("./response/failure/error");
exports.DEFAULT_LIMIT = "100kb";
function getEncoding(req) {
    return req.headers["content-encoding"] || "identity";
}
exports.getEncoding = getEncoding;
function getContentLength(req) {
    return req.headers["content-length"] || undefined;
}
exports.getContentLength = getContentLength;
function getStream(req) {
    return new Promise((resolve, reject) => {
        const encoding = getEncoding(req);
        switch (encoding) {
            case "deflate": {
                resolve(req.pipe(zlib_1.createInflate()));
                break;
            }
            case "gzip": {
                resolve(req.pipe(zlib_1.createGunzip()));
                break;
            }
            case "identity": {
                resolve(req);
                break;
            }
            default: {
                reject(createError(415, `unsupported content encoding "${encoding}"`, {
                    encoding: encoding,
                    type: "encoding.unsupported"
                }));
            }
        }
    });
}
exports.getStream = getStream;
function getStreamBody(req, { limit } = { limit: exports.DEFAULT_LIMIT }) {
    const encoding = getEncoding(req);
    const length = getContentLength(req);
    const getRawBodyOptions = encoding === "identity" && length !== undefined
        ? { limit, length, encoding: "utf-8" }
        : { limit, encoding: "utf-8" };
    return (stream) => getRawBody(stream, getRawBodyOptions);
}
exports.getStreamBody = getStreamBody;
function getJson(req, options) {
    const types = [
        "application/json",
        "application/json-rpc",
        "application/jsonrequest"
    ];
    const type = (req.headers["content-type"] || "").toLowerCase();
    if (!types.includes(type)) {
        return Promise.reject(createError(415, `unsupported content-type: "${type}"`, {
            contentType: type,
            type: "content_type.unsupported"
        }));
    }
    return getStream(req).then(getStreamBody(req, options));
}
exports.getJson = getJson;
function handleIncomingMessage(service, req, options) {
    return getJson(req, options).then((json) => request_1.parseRequest(json)
        .chain(request_1.validateRequest)
        .fold((error) => Promise.resolve({
        response: failure_1.Failure(error)
    }), request => service_1.handleRequest(request, service).then(response => ({
        request,
        response
    }))));
}
exports.handleIncomingMessage = handleIncomingMessage;
function createPostRoute(service, options) {
    return function (req, res, next) {
        handleIncomingMessage(service, req, options)
            .then(({ request, response }) => {
            if (request && request.id === undefined) {
                res.statusCode = 204;
                res.end();
                return;
            }
            if (failure_1.isFailure(response)) {
                switch (response.error.code) {
                    case error_1.METHOD_NOT_FOUND: {
                        res.statusCode = 404;
                        break;
                    }
                    case error_1.INVALID_REQUEST: {
                        res.statusCode = 400;
                        break;
                    }
                    default: {
                        res.statusCode = 500;
                    }
                }
            }
            else {
                res.statusCode = 200;
            }
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify(response));
            res.end();
        })
            .catch(next);
    };
}
exports.createPostRoute = createPostRoute;
