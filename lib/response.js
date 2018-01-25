"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success_1 = require("./response/success");
function caseOf({ success, failure }, response) {
    return success_1.isSuccess(response) ? success(response) : failure(response);
}
exports.caseOf = caseOf;
