/// <reference types="node" />
import { AxiosRequestConfig } from 'axios';
import { IncomingMessage, ServerResponse } from 'http';
declare function createForwarder(baseUrl: URL | RequestInfo, axiosOptions?: AxiosRequestConfig): (req: IncomingMessage | Request, res: ServerResponse) => Promise<void>;
export { createForwarder };
