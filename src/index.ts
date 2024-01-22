import axios, { AxiosRequestConfig, Method, AxiosHeaders } from 'axios';
import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http';

function createForwarder(baseUrl: URL | RequestInfo, axiosOptions: AxiosRequestConfig = {}) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const bodyAvailable = 'body' in req;

    const onEnd = async (requestData?: string) => {
      const { method, url, headers } = req;

      const body = bodyAvailable ? req.body : JSON.parse(requestData || '{}'); // Parse the request body

      const mergedHeaders = {
        ...axiosOptions.headers,
        ...headers,
      } as AxiosHeaders;

      const mergedAxiosOptions: AxiosRequestConfig = {
        method: method as Method,
        url: `${baseUrl}${url}`,
        headers: mergedHeaders,
        data: body,
        ...axiosOptions, // Include any custom options provided by the user
      };

      try {
        const axiosResponse = await axios(mergedAxiosOptions);

        res.writeHead(axiosResponse.status, axiosResponse.statusText, {
          'Content-Type': 'application/json',
          ...axiosResponse.headers,
        } as OutgoingHttpHeaders);
  
        res.end(JSON.stringify(axiosResponse.data));
      } catch (error: any) {
        if (error.response) {
          const { status, statusText, headers, data } = error.response;

          res.writeHead(status, statusText, {
            'Content-Type': 'application/json',
            ...headers,
          } as OutgoingHttpHeaders);

          res.end(JSON.stringify(data));
          return;
        } else {
          console.error('Error forwarding request:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
          return;
        }
      }
    }

    if (bodyAvailable) {
      onEnd();
    } else {
      let requestData = '';
      req.setEncoding('utf8');

      req.on('data', (chunk) => {
        requestData += chunk;
      });

      req.on('end', () => {
        onEnd(requestData);
      });
    }
  };
}

export { createForwarder };
