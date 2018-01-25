import { IncomingMessage, ServerResponse } from "http"
import { createGunzip, createInflate } from "zlib"
import { Readable } from "stream"

import * as createError from "http-errors"
import * as getRawBody from "raw-body"

import { Service, handleRequest } from "./service"
import { validateRequest, parseRequest, Request } from "./request"
import { Response } from "./response"
import { Failure, isFailure } from "./response/failure"
import { FailureError } from "./response/failure"
import { METHOD_NOT_FOUND, INVALID_REQUEST } from "./response/failure/errors"

export const DEFAULT_LIMIT = "100kb"

export interface BodyParserOptions {
    limit: string | number
}

interface Context {
    request?: Request
    response: Response
}

function getEncoding(req: IncomingMessage): string {
    return req.headers["content-encoding"] || "identity"
}

function getContentLength(req: IncomingMessage): string | void {
    return req.headers["content-length"] || undefined
}

function getStream(req: IncomingMessage): Promise<Readable> {
    return new Promise((resolve, reject) => {
        const encoding = getEncoding(req)

        switch (encoding) {
            case "deflate": {
                resolve(req.pipe(createInflate()))
                break
            }
            case "gzip": {
                resolve(req.pipe(createGunzip()))
                break
            }
            case "identity": {
                resolve(req)
                break
            }
            default: {
                reject(
                    createError(
                        415,
                        `unsupported content encoding "${encoding}"`,
                        {
                            encoding: encoding,
                            type: "encoding.unsupported"
                        }
                    )
                )
            }
        }
    })
}

function getStreamBody(
    req: IncomingMessage,
    { limit }: BodyParserOptions = { limit: DEFAULT_LIMIT }
) {
    const encoding = getEncoding(req)
    const length = getContentLength(req)

    const getRawBodyOptions =
        encoding === "identity" && length !== undefined
            ? { limit, length, encoding: "utf-8" }
            : { limit, encoding: "utf-8" }

    return (stream: Readable) => getRawBody(stream, getRawBodyOptions)
}

function getJson(
    req: IncomingMessage,
    options?: BodyParserOptions
): Promise<string> {
    const types = [
        "application/json",
        "application/json-rpc",
        "application/jsonrequest"
    ]

    const type = (req.headers["content-type"] || "").toLowerCase()

    if (!types.includes(type)) {
        return Promise.reject(
            createError(415, `unsupported content-type: "${type}"`, {
                contentType: type,
                type: "content_type.unsupported"
            })
        )
    }

    return getStream(req).then(getStreamBody(req, options))
}

function handleIncomingMessage(
    service: Service,
    req: IncomingMessage,
    options?: BodyParserOptions
): Promise<Context> {
    return getJson(req, options).then((json: string) =>
        parseRequest(json)
            .chain(validateRequest)
            .fold(
                (error: FailureError) =>
                    Promise.resolve({
                        response: Failure(error) as Response
                    }),
                request =>
                    handleRequest(request, service).then(response => ({
                        request,
                        response
                    }))
            )
    )
}

export function createPostRoute(service: Service, options?: BodyParserOptions) {
    return function(
        req: IncomingMessage,
        res: ServerResponse,
        next: (error: any) => void
    ): void {
        handleIncomingMessage(service, req, options)
            .then(({ request, response }) => {
                if (request && request.id === undefined) {
                    res.statusCode = 204
                    res.end()
                    return
                }

                if (isFailure(response)) {
                    switch (response.error.code) {
                        case METHOD_NOT_FOUND: {
                            res.statusCode = 404
                            break
                        }
                        case INVALID_REQUEST: {
                            res.statusCode = 400
                            break
                        }
                        default: {
                            res.statusCode = 500
                        }
                    }
                } else {
                    res.statusCode = 200
                }

                res.setHeader("Content-Type", "application/json")
                res.write(JSON.stringify(response))
                res.end()
            })
            .catch(next)
    }
}
