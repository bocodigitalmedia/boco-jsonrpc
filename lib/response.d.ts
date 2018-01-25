import { Success } from "./response/success";
import { Failure } from "./response/failure";
export declare type Response = Success | Failure;
export interface Cases<T> {
    success: (a: Success) => T;
    failure: (b: Failure) => T;
}
export declare function caseOf<T>({success, failure}: Cases<T>, response: Response): T;
