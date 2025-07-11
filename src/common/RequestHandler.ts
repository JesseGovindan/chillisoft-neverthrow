import { AuthenticatedRequest, Request } from "./Request";
import { Response } from "./Response";

export type RequestHandler = (request: Request) => Response
export type AsyncRequestHandler = (request: Request) => Promise<Response>
export type AuthenticatedRequestHandler = (request: AuthenticatedRequest) => Response
