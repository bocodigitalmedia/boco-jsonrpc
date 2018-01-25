import { Success, isSuccess } from "./response/success"
import { Failure } from "./response/failure"

export type Response = Success | Failure

export interface Cases<T> {
    success: (a: Success) => T
    failure: (b: Failure) => T
}

export function caseOf<T>(
    { success, failure }: Cases<T>,
    response: Response
): T {
    return isSuccess(response) ? success(response) : failure(response)
}
