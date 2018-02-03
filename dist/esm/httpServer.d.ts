/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { Server } from './server';
export interface PostRouteOptions {
    limit: string | number;
    replacer?: (key: string, value: any) => any;
}
export declare function createPostRoute(server: Server, {limit, replacer}?: Partial<PostRouteOptions>): (req: IncomingMessage, res: ServerResponse, next: (error: any) => void) => void;
