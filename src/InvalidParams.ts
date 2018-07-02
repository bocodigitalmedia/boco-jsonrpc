import { FailureError } from './FailureError'
import { Request } from './Request'

export type InvalidParams = FailureError<
    -32602,
    { request: Request; errors: string[] }
>

export const InvalidParams = (data: InvalidParams['data']): InvalidParams =>
    FailureError(-32602, data, 'Invalid params')
