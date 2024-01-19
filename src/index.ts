import axios, { AxiosRequestConfig, Method } from 'axios';
import { Request, Response } from 'express';

function createForwarder(baseUrl: URL | RequestInfo, axiosOptions: AxiosRequestConfig = {}) {
  return async (req: Request, res: Response) => {
    try {
      const { method, url, body, params, headers } = req;

      // Use URL class for proper URL handling
      const base = baseUrl instanceof URL ? baseUrl : new URL(baseUrl as string);
      const targetUrl = new URL(url, base);

      const mergedHeaders = {
        ...axiosOptions.headers,
        ...headers,
      };

      const mergedAxiosOptions: AxiosRequestConfig = {
        method: method as Method,
        url: targetUrl.href, // Construct the URL properly
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

export { createForwarder }
