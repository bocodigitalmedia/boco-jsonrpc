/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { Service } from "./service";
import { Request } from "./request";
import { Response } from "./response";
export declare const DEFAULT_LIMIT = "100kb";
export interface Options {
    limit: string | number;
}
export interface Context {
    request?: Request;
    response: Response;
}
export declare function getJson(req: IncomingMessage, options?: Options): Promise<string>;
export declare function handleIncomingMessage(service: Service, req: IncomingMessage, options?: Options): Promise<Context>;
export declare function createPostRoute(service: Service, options?: Options): (req: IncomingMessage, res: ServerResponse, next: (error: any) => void) => void;
