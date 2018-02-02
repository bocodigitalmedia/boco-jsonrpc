import { FooError, BarError } from "./errors"

export function add(a: number, b: number) {
    return a + b
}

export function sub(a: number, b: number) {
    return a - b
}

export function foo(a: number, b: number) {
    throw new FooError({ a, b })
}

export function bar(a: number, b: number) {
    throw new BarError({ a, b })
}

export function baz() {
    throw "BAZ"
}
