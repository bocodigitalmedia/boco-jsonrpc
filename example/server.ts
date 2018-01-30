import * as Express from "express"
import { service } from "./service"
import { httpServer } from ".."

const app = Express()

app.post("/math", httpServer.createPostRoute(service, { limit: "100kb" }))

app.listen(3000, () =>
    process.stdout.write("JSON-RPC server started on port 3000\n")
)
