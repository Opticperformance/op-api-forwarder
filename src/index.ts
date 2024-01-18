import axios, { AxiosRequestConfig, Method } from 'axios';
import { Request, Response } from 'express';

function createForwarder(baseUrl: string, axiosOptions: AxiosRequestConfig = {}) {
  return async (req: Request, res: Response) => {
    try {
      const { method, url, body, params, headers } = req;

      const mergedHeaders = {
        ...axiosOptions.headers,
        ...headers,
      };

      const mergedAxiosOptions: AxiosRequestConfig = {
        method: method as Method,
        url: `${baseUrl}${url}`,
        headers: mergedHeaders,
        data: body,
        params,
        paramsSerializer: params => {
          return new URLSearchParams(params).toString();
        },
        ...axiosOptions, // Include any custom options provided by the user
      };

      const axiosResponse = await axios(mergedAxiosOptions);

      res.status(axiosResponse.status).json(axiosResponse.data);
    } catch (error: any) {
      console.error('Error forwarding request:', error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
}

module.exports = createForwarder;