import { Success } from './Success';
import { Failure } from './Failure';
import { union } from 'io-ts';
import { right, left } from 'fp-ts/lib/Either';
const ioType = union([Success.ioType, Failure.ioType]);
const toEither = (response) => Success.ioType.is(response) ? right(response) : left(response);
export const Response = {
    ioType,
    toEither
};
