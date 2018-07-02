import { FailureError } from './FailureError'
import { Request } from './Request'

export type MethodNotFound = FailureError<-32601, { request: Request }>

export const MethodNotFound = (data: MethodNotFound['data']): MethodNotFound =>
    FailureError(-32601, data, 'Method not found')
