var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import { receiveResponseJson } from './client';
export class InvalidJsonRpcResponse extends Error {
    constructor(response) {
        super(`Invalid JSON RPC response`);
        this.response = response;
    }
}
export function FetchClient(url, options = {}) {
    return Object.assign({ url }, options);
}
export function fetchClientRequest(request, _a, _b = {}) {
    var { url, replacer } = _a, _c = _a.requestInit, _d = _c === void 0 ? {} : _c, { headers: clientHeaders = {} } = _d, clientInit = __rest(_d, ["headers"]);
    var { headers: requestHeaders = {} } = _b, requestInit = __rest(_b, ["headers"]);
    const body = JSON.stringify(request, replacer);
    const headers = mergeHeaders(clientHeaders, requestHeaders, {
        Accept: 'application/json-rpc; application/json',
        'Content-Type': 'application/json-rpc'
    });
    const init = Object.assign({}, clientInit, requestInit, { method: 'POST', headers,
        body });
    return fetch(url, init).then(response => response.status === 204
        ? Promise.resolve(undefined)
        : response.text().then(receiveResponseJson));
}
function getHeadersTuples(a) {
    return typeof a.entries === 'function'
        ? [...a.entries()]
        : Array.isArray(a) ? a : [...Object.entries(a)];
}
function mergeHeaders(...args) {
    return args
        .reduce((memo, a) => [...memo, ...getHeadersTuples(a)], [])
        .reduce((memo, [key, val]) => (Object.assign({}, memo, { [key]: val })), {});
}
