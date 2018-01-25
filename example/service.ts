import { Service, InvalidParams } from "../src"
import * as math from "./math"

const isNumber = n => typeof n === "number"
const isNumberTuple = (a: any): a is [number, number] =>
    Array.isArray(a) && a.length === 2 && a.every(isNumber)

export const service = Service(math, {
    paramsToArgs: (method, params) => {
        console.log(method, params)
        if (isNumberTuple(params)) {
            return params
        } else {
            throw "FOO"
        }
    },
    transformError: (error: any) =>
        error === "FOO" ? InvalidParams("must be a tuple of numbers") : error
})
