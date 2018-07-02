"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.ParseError = (data) => FailureError_1.FailureError(-32700, data, 'Parse error');
