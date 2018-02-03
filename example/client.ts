import {
    RequestItem,
    isSuccess,
    FetchClient,
    fetchClientRequest,
    ResponseItem
} from '..'

import fetch from 'node-fetch-polyfill'

Object.assign(global, { fetch })

let i: number = 0

const client = FetchClient('http://localhost:3000/math')

const logResponse = (req: RequestItem) => (res?: ResponseItem) =>
    console.log(
        req.method,
        req.params,
        res === undefined
            ? 'No response'
            : isSuccess(res) ? res.result : res.error.message
    )

const send = (req: RequestItem) =>
    fetchClientRequest(req, client).then(logResponse(req))

const exec = method => (...params: any[]) =>
    send(RequestItem(method, params, i++))

exec('add')(1, 2)
exec('sub')(5, 5)
exec('foo')(1, 2)
exec('bar')(1, 2)
exec('baz')(1, 2)
exec('qux')(1, 2)
