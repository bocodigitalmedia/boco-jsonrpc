"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const either_1 = require("fp-ts/lib/either");
const response_1 = require("./response");
function receiveResponseData(data) {
    return response_1.validateResponse(data).fold(l => Promise.reject(l), r => Promise.resolve(r));
}
exports.receiveResponseData = receiveResponseData;
function receiveResponseJson(json) {
    return either_1.tryCatch(() => JSON.parse(json)).fold(l => Promise.reject(l), r => receiveResponseData(r));
}
exports.receiveResponseJson = receiveResponseJson;
