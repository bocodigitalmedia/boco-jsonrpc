"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = require("zlib");
const createError = require("http-errors");
const getRawBody = require("raw-body");
const service_1 = require("./service");
const failure_1 = require("./response/failure");
const errors_1 = require("./response/failure/errors");
exports.DEFAULT_LIMIT = "100kb";
function getEncoding(req) {
    return req.headers["content-encoding"] || "identity";
}
function getContentLength(req) {
    return req.headers["content-length"] || undefined;
}
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
function getStreamBody(req, { limit } = { limit: exports.DEFAULT_LIMIT }) {
    const encoding = getEncoding(req);
    const length = getContentLength(req);
    const getRawBodyOptions = encoding === "identity" && length !== undefined
        ? { limit, length, encoding: "utf-8" }
        : { limit, encoding: "utf-8" };
    return (stream) => getRawBody(stream, getRawBodyOptions);
}
function getJson(req, options) {
    const pattern = /^application\/(json|json-rpc|jsonrequest)(;.+)?$/i;
    const type = req.headers["content-type"] || "";
    if (!pattern.test(type)) {
        return Promise.reject(createError(415, `unsupported content-type: "${type}"`, {
            contentType: type,
            type: "content_type.unsupported"
        }));
    }
    return getStream(req).then(getStreamBody(req, options));
}
function createPostRoute(service, options) {
    return function (req, res, next) {
        getJson(req, options)
            .then((json) => service_1.receiveJson(json, service))
            .then(response => {
            const json = (code, response) => {
                res.writeHead(code, {
                    "Content-Type": "application/json"
                });
                res.write(JSON.stringify(response));
                res.end();
            };
            if (response === undefined) {
                res.writeHead(204);
                return res.end();
            }
            if (failure_1.isFailure(response) && errors_1.isMethodNotFound(response.error)) {
                return json(404, response);
            }
            if (failure_1.isFailure(response) && errors_1.isInvalidRequest(response.error)) {
                return json(400, response);
            }
            return json(200, response);
        })
            .catch(next);
    };
}
exports.createPostRoute = createPostRoute;
