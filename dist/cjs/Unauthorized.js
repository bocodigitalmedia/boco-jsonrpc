"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FailureError_1 = require("./FailureError");
exports.Unauthorized = (data) => FailureError_1.FailureError(-32401, data, 'Unauthorized');
