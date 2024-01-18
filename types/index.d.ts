import { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';

declare function createForwarder(baseUrl: string, axiosOptions?: AxiosRequestConfig): (req: Request, res: Response) => Promise<void>;

export = createForwarder;