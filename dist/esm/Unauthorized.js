import { FailureError } from './FailureError';
export const Unauthorized = (data) => FailureError(-32401, data, 'Unauthorized');
