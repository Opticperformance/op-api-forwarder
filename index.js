const axios = require('axios');

function createForwarder({ baseUrl, headers, customOptions } = {}) {
  return async (req, res) => {
    try {
      const { method, url, body, params } = req;

      Object.assign(headers, req.headers);

      const axiosOptions = {
        method, // Dynamically set the HTTP method
        url: `${baseUrl}${url}`,
        headers,
        data: body,
        params,
        paramsSerializer: params => {
          return new URLSearchParams(params).toString();
        },
        ...customOptions, // Include any custom options provided by the user
      };

      const axiosResponse = await axios(axiosOptions);

      res.status(axiosResponse.status).json(axiosResponse.data);
    } catch (error) {
      console.error('Error forwarding request:', error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
}

module.exports = createForwarder;
