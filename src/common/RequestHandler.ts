import { Request } from "./Request";
import { Response } from "./Response";

export type RequestHandler = (request: Request) => Response
