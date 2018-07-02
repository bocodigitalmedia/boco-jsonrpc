export interface FailureError<C extends number = number, T = {}> {
    code: C
    message: string
    data: T
}

export function FailureError<C extends number, T>(
    code: C,
    data: T,
    message: string
): FailureError<C, T> {
    return { code, data, message }
}
