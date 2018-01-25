import * as Express from "express"
import { service } from "./service"
import { createPostRoute } from "boco-jsonrpc"

const app = Express()

app.post("/math", createPostRoute(service, { limit: "100kb" }))

app.listen(3000, () =>
    process.stdout.write("JSON-RPC server started on port 3000\n")
)
