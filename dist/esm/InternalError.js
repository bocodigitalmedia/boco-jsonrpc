import { FailureError } from './FailureError';
export const InternalError = (data) => FailureError(-32603, data, 'Internal error');
