import { Type, literal, any, string, union, number, strict } from 'io-ts'

export interface Success<T = {}> {
    jsonrpc: '2.0'
    result: T
    id: string | number
    error?: never
}

const ioType: Type<Success> = strict({
    jsonrpc: literal('2.0'),
    result: any,
    id: union([string, number])
})

function SuccessConstructor<T>(result: T, id: string | number): Success<T> {
    return {
        jsonrpc: '2.0',
        result,
        id
    }
}

export const Success = Object.assign(SuccessConstructor, { ioType })
