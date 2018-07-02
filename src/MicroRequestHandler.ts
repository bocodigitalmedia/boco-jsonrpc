import { FailureError } from './FailureError'
import { Request } from './Request'
import { IncomingMessage } from 'http'
import { TaskEither } from 'fp-ts/lib/TaskEither'

export interface MicroRequestHandler<
    L extends FailureError = FailureError,
    R = {}
> {
    (request: Request, message: IncomingMessage): TaskEither<L, R>
}
