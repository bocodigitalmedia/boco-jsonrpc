import fetch from "node-fetch-polyfill"

import {
    Request,
    isBatchRequest,
    isResponse,
    isNotification,
    isFailure,
    isSuccess,
    fetchClient
} from ".."

Object.assign(global, { fetch })
let i: number = 0

const client = fetchClient.FetchClient("http://localhost:3000/math")

const req = method => (...params: any[]) => Request(method, params, i++)
const fn = method => (...params: any[]) => send(Request(method, params, i++))

const [add, sub, foo, bar, baz, qux] = [
    "add",
    "sub",
    "foo",
    "bar",
    "baz",
    "qux"
].map(fn)

const send = (req: Request) =>
    fetchClient
        .sendRequest(req, client)
        .then(
            (response: Response) =>
                isSuccess(response)
                    ? Promise.resolve(response)
                    : Promise.reject(response)
        )
        .then(
            response => console.log("OK", response),
            error =>
                isFailure(error)
                    ? console.log("KO", error)
                    : console.error(error)
        )

add(1, 2)
sub(5, 5)
foo(1, 2)
bar(1, 2)
baz(1, 2)
qux(1, 2)
