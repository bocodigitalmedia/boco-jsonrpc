"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.MethodNotFound = (data) => FailureError_1.FailureError(-32601, data, 'Method not found');
