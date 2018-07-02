import { FailureError } from './FailureError'
import { Request } from './Request'

export type InternalError = FailureError<
    -32603,
    { request?: Request; cause: any }
>

export const InternalError = (data: InternalError['data']): InternalError =>
    FailureError(-32603, data, 'Internal error')
