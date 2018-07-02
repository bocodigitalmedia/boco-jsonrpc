import { FailureError } from './FailureError'

export type Unauthorized = FailureError<
    -32401,
    { authorization: string | null; reason: string }
>

export const Unauthorized = (data: Unauthorized['data']): Unauthorized =>
    FailureError(-32401, data, 'Unauthorized')
