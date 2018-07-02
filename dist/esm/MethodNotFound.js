import { FailureError } from './FailureError';
export const MethodNotFound = (data) => FailureError(-32601, data, 'Method not found');
