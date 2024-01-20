import axios, { AxiosRequestConfig, Method } from 'axios';
import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http';

function createForwarder(baseUrl: URL | RequestInfo, axiosOptions: AxiosRequestConfig = {}) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      let requestData = '';
      req.setEncoding('utf8');

      req.on('data', (chunk) => {
        requestData += chunk;
      });

      req.on('end', async () => {
        const { method, url, headers } = req;
        const body = JSON.parse(requestData || '{}'); // Parse the request body

        const mergedHeaders = {
          ...axiosOptions.headers,
          ...headers,
        };

        const mergedAxiosOptions: AxiosRequestConfig = {
          method: method as Method,
          url: `${baseUrl}${url}`,
          headers: mergedHeaders,
          data: body,
          ...axiosOptions, // Include any custom options provided by the user
        };

        const axiosResponse = await axios(mergedAxiosOptions);

        res.writeHead(axiosResponse.status, axiosResponse.statusText, {
          'Content-Type': 'application/json',
          ...axiosResponse.headers,
        } as OutgoingHttpHeaders);

        res.end(JSON.stringify(axiosResponse.data));
      });
    } catch (error: any) {
      console.error('Error forwarding request:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
  };
}

export { createForwarder };
