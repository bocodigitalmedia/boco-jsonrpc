import { FailureError } from './FailureError'

export type ParseError = FailureError<-32700, { json: string; message: string }>

export const ParseError = (data: ParseError['data']): ParseError =>
    FailureError(-32700, data, 'Parse error')
