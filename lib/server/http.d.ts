/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { Service } from "../service";
export declare const DEFAULT_LIMIT = "150kb";
export interface PostRouteOptions {
    limit: string | number;
    replacer?: (key: string, value: any) => any;
}
export declare function createPostRoute(service: Service, {limit, replacer}?: Partial<PostRouteOptions>): (req: IncomingMessage, res: ServerResponse, next: (error: any) => void) => void;
