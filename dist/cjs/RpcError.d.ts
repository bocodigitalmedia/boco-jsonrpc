import { InternalError } from './InternalError';
import { InvalidParams } from './InvalidParams';
import { InvalidRequest } from './InvalidRequest';
import { MethodNotFound } from './MethodNotFound';
import { Unauthorized } from './Unauthorized';
import { ParseError } from './ParseError';
export declare type RpcError = InternalError | InvalidParams | InvalidRequest | MethodNotFound | ParseError | Unauthorized;
