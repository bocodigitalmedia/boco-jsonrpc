import { tryCatch } from 'fp-ts/lib/either';
import { validateResponse } from './response';
export function receiveResponseData(data) {
    return validateResponse(data).fold(l => Promise.reject(l), r => Promise.resolve(r));
}
export function receiveResponseJson(json) {
    return tryCatch(() => JSON.parse(json)).fold(l => Promise.reject(l), r => receiveResponseData(r));
}
