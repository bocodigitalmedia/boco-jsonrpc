import { FailureError } from './FailureError';
export const InvalidRequest = (data) => FailureError(-32600, data, 'Invalid request');
