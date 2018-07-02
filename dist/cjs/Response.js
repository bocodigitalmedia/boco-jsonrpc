"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Success_1 = require("./Success");
const Failure_1 = require("./Failure");
const io_ts_1 = require("io-ts");
const Either_1 = require("fp-ts/lib/Either");
const ioType = io_ts_1.union([Success_1.Success.ioType, Failure_1.Failure.ioType]);
const toEither = (response) => Success_1.Success.ioType.is(response) ? Either_1.right(response) : Either_1.left(response);
exports.Response = {
    ioType,
    toEither
};
