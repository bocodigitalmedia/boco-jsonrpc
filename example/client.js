const rpc = require("..")
const fetch = require("node-fetch")

let i = 0

const req = method => params => ({
    jsonrpc: "2.0",
    method,
    params,
    id: i++
})

const [add, sub, foo, bar, baz, qux] = [
    "add",
    "sub",
    "foo",
    "bar",
    "baz",
    "qux"
].map(req)

const send = request =>
    fetch("http://localhost:3000/math", {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    }).then(
        response =>
            response.status === 204 ? "notification sent" : response.json()
    )

send([
    add([1, 2]),
    add(["foo", "bar"]),
    sub([5, 3]),
    foo([1, 1]),
    bar([1, 1]),
    baz([1, 1]),
    qux()
]).then(console.log, console.error)
