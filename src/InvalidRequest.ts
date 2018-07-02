import { FailureError } from './FailureError'

export type InvalidRequest = FailureError<
    -32600,
    { request: object; errors: string[] }
>

export const InvalidRequest = (data: InvalidRequest['data']): InvalidRequest =>
    FailureError(-32600, data, 'Invalid request')
