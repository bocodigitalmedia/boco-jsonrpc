"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.InternalError = (data) => FailureError_1.FailureError(-32603, data, 'Internal error');
