import { ValidateParamsFn, Method, Service } from "../src"
import { add, sub, foo, bar, baz } from "./math"

const isNumber = (a: any): a is number => typeof a === "number"

const isNumberTuple = (a: any): a is [number, number] =>
    Array.isArray(a) && a.length === 2 && a.every(isNumber)

const validateParams: ValidateParamsFn = (a, pass, fail) =>
    isNumberTuple(a) ? pass(a) : fail("Must be a tuple of numbers")

const method = (a: Function) => Method(a, validateParams)

export const service = Service(
    {
        add: method(add),
        sub: method(sub),
        foo: method(foo),
        bar: method(bar),
        baz: method(baz)
    },
    error => (error === "BAZ" ? { code: 54321, message: "BAZ!" } : error)
)
