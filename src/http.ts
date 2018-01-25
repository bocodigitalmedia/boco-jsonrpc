import { IncomingMessage, ServerResponse } from "http"
import { createGunzip, createInflate } from "zlib"
import { Readable } from "stream"

import * as createError from "http-errors"
import * as getRawBody from "raw-body"

import { Service, receiveJson } from "./service"
import { Response } from "./response"
import { isFailure } from "./response/failure"
import { isMethodNotFound, isInvalidRequest } from "./response/failure/errors"

export const DEFAULT_LIMIT = "100kb"

export interface BodyParserOptions {
    limit: string | number
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

    return getStream(req).then(getStreamBody(req, options))
}

export function createPostRoute(service: Service, options?: BodyParserOptions) {
    return function(
        req: IncomingMessage,
        res: ServerResponse,
        next: (error: any) => void
    ): void {
        getJson(req, options)
            .then((json: string) => receiveJson(json, service))
            .then(response => {
                const json = (
                    code: number,
                    response: Response | Response[] | undefined
                ): void => {
                    res.writeHead(code, {
                        "Content-Type": "application/json"
                    })
                    res.write(JSON.stringify(response))
                    res.end()
                }

                if (response === undefined) {
                    res.writeHead(204)
                    return res.end()
                }

                if (isFailure(response) && isMethodNotFound(response.error)) {
                    return json(404, response)
                }

                if (isFailure(response) && isInvalidRequest(response.error)) {
                    return json(400, response)
                }

                return json(200, response)
            })
            .catch(next)
    }
}
