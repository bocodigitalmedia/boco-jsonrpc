import { Success } from './Success'
import { Failure } from './Failure'
import { union, Type } from 'io-ts'
import { Either, right, left } from 'fp-ts/lib/Either'
import { FailureError } from './FailureError'

export type Response<L extends FailureError = FailureError, R = {}> =
    | Failure<L>
    | Success<R>

const ioType: Type<Response> = union([Success.ioType, Failure.ioType])

const toEither = <L extends FailureError, R>(
    response: Response<L, R>
): Either<Failure<L>, Success<R>> =>
    Success.ioType.is(response) ? right(response) : left(response)

export const Response = {
    ioType,
    toEither
}
