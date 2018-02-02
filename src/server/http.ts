import {
    Response,
    isFailure,
    isMethodNotFoundError,
    isInvalidRequestError
} from "../response"

import { IncomingMessage, ServerResponse } from "http"
import { createGunzip, createInflate } from "zlib"
import { Readable } from "stream"
import { Service, receiveJson } from "../service"

import * as createError from "http-errors"
import * as getRawBody from "raw-body"

export const DEFAULT_LIMIT = "150kb"

export interface PostRouteOptions {
    limit: string | number
    replacer?: (key: string, value: any) => any
}

function getEncoding(req: IncomingMessage): string {
    return req.headers["content-encoding"] || "identity"
}

function getContentLength(req: IncomingMessage): string | void {
    return req.headers["content-length"] || undefined
}

function getBodyStream(req: IncomingMessage): Promise<Readable> {
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

function getBody(req: IncomingMessage, { limit }: getRawBody.Options = {}) {
    const isIdentity = getEncoding(req) === "identity"
    const length = getContentLength(req)

    const getRawBodyOptions =
        isIdentity && length !== undefined
            ? { limit, length, encoding: "utf-8" }
            : { limit, encoding: "utf-8" }

    return getBodyStream(req).then(stream =>
        getRawBody(stream, getRawBodyOptions)
    )
}

function getJson(
    req: IncomingMessage,
    options?: getRawBody.Options
): Promise<string> {
    const pattern = /^application\/(json|json-rpc|jsonrequest)(;.+)?$/i
    const type: string = req.headers["content-type"] || ""

    if (!pattern.test(type)) {
        return Promise.reject(
            createError(415, `unsupported content-type: "${type}"`, {
                contentType: type,
                type: "content_type.unsupported"
            })
        )
    }

    return getBody(req, options)
}

export function createPostRoute(
    service: Service,
    { limit = DEFAULT_LIMIT, replacer }: Partial<PostRouteOptions> = {}
) {
    return function(
        req: IncomingMessage,
        res: ServerResponse,
        next: (error: any) => void
    ): void {
        getJson(req, { limit })
            .then((json: string) => receiveJson(json, service))
            .then(response => {
                const json = (
                    code: number,
                    response: Response | Response[] | undefined
                ): void => {
                    res.writeHead(code, {
                        "Content-Type": "application/json"
                    })
                    res.write(JSON.stringify(response, replacer))
                    res.end()
                }

                if (response === undefined) {
                    res.writeHead(204)
                    return res.end()
                }

                if (
                    isFailure(response) &&
                    isMethodNotFoundError(response.error)
                ) {
                    return json(404, response)
                }

                if (
                    isFailure(response) &&
                    isInvalidRequestError(response.error)
                ) {
                    return json(400, response)
                }

                return json(200, response)
            })
            .catch(next)
    }
}
