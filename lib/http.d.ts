/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { Service } from "./service";
export declare const DEFAULT_LIMIT = "100kb";
export interface BodyParserOptions {
    limit: string | number;
}
export declare function createPostRoute(service: Service, options?: BodyParserOptions): (req: IncomingMessage, res: ServerResponse, next: (error: any) => void) => void;
