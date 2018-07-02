import { FailureError } from './FailureError';
export const ParseError = (data) => FailureError(-32700, data, 'Parse error');
