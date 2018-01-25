import { FailureError } from "./response/failure";
import { Request } from "./request";
import { Either } from "fp-ts/lib/Either";
import { Method } from "./method";
import { Response } from "./response";
export interface Methods {
    [key: string]: Method;
}
export declare type TransformErrorFn = (error: any) => any;
export interface Service {
    methods: Methods;
    transformError: TransformErrorFn;
}
export declare function Service(methods: Methods, transformError?: TransformErrorFn): Service;
export declare function hasMethod(method: string, service: Service): boolean;
export declare function getMethod(request: Request, service: Service, msg?: string): Either<FailureError, Method>;
export declare function toFailureError(error: any): FailureError;
export declare function handleRequest(request: any, service: Service): Promise<Response>;
