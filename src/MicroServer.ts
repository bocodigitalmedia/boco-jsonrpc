import { IncomingMessage } from 'http'
import { text } from 'micro'
import { Request } from './Request'
import { Failure } from './Failure'
import { Success } from './Success'
import { fromEither } from 'fp-ts/lib/TaskEither'
import { Response } from './Response'
import { Option, some, none } from 'fp-ts/lib/Option'
import { FailureError } from './FailureError'
import { RpcError } from './RpcError'
import { Task } from 'fp-ts/lib/Task'
import { MicroRequestHandler } from './MicroRequestHandler'

const contentTypePattern = /^application\/json(-rpc|request)?$/i

const getOption = <L extends FailureError, R>(
    task: MicroRequestHandler<L, R>
) => (
    json: string,
    message: IncomingMessage
): Task<Option<Response<L | RpcError, R>>> =>
    fromEither(Request.parse(json))
        .mapLeft<Option<Failure<L | RpcError>>>(error => some(Failure(error)))
        .chain<Option<Success<R>>>(request =>
            task(request, message).bimap(
                error => (request.id ? some(Failure(error, request.id)) : none),
                result =>
                    request.id ? some(Success(result, request.id)) : none
            )
        )
        .fold<Option<Response<L | RpcError, R>>>(e => e, r => r)

const handleRequest = <L extends FailureError, R>(
    task: MicroRequestHandler<L, R>,
    options: { limit?: string; encoding?: string } = {
        limit: '1k',
        encoding: 'utf8'
    }
) => async (
    message: IncomingMessage
): Promise<Response<L | RpcError, R> | null> => {
    // const contentType = message.headers['content-type'] || ''
    // const accept = message.headers['accept'] || ''

    // if (!contentTypePattern.test(contentType))
    //     throw createError(415, 'Unsupported Media Type')

    // if (!contentTypePattern.test(accept))
    //     throw createError(406, 'Not acceptable')

    const json = await text(message, options)

    return getOption(task)(json, message)
        .map(option => option.toNullable())
        .run()
}

export const MicroServer = {
    handleRequest,
    getOption,
    contentTypePattern
}
