export class FooError extends Error {
    public code: number = 12345

    constructor(public data: any) {
        super('FOO!')
    }
}

export class BarError extends Error {
    constructor(public bar: any) {
        super('BAR!')
    }
}
