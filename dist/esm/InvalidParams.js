import { FailureError } from './FailureError';
export const InvalidParams = (data) => FailureError(-32602, data, 'Invalid params');
