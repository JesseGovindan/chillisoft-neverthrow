import { AuthenticatedRequest, Request } from "./Request";
import { Response } from "./Response";

export type RequestHandler = (request: Request) => Response
export type AuthenticatedRequestHandler = (request: AuthenticatedRequest) => Response
