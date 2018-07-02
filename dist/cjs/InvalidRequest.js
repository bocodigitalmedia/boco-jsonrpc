"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.InvalidRequest = (data) => FailureError_1.FailureError(-32600, data, 'Invalid request');
