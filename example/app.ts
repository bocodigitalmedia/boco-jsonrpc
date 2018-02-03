import * as Express from 'express'
import { server } from './server'
import { createPostRoute } from '..'

const app = Express()

app.post('/math', createPostRoute(server, { limit: '100kb' }))

app.listen(3000, () =>
    process.stdout.write('JSON-RPC server started on port 3000\n')
)
