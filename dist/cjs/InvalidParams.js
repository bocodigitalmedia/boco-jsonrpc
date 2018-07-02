"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.InvalidParams = (data) => FailureError_1.FailureError(-32602, data, 'Invalid params');
