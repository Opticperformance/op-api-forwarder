"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForwarder = void 0;
const axios_1 = __importDefault(require("axios"));
function createForwarder(baseUrl, axiosOptions = {}) {
    return async (req, res) => {
        try {
            let requestData = '';
            req.setEncoding('utf8');
            req.on('data', (chunk) => {
                requestData += chunk;
            });
            req.on('end', async () => {
                const { method, url, headers } = req;
                const body = JSON.parse(requestData || '{}');
                const mergedHeaders = {
                    ...axiosOptions.headers,
                    ...headers,
                };
                const mergedAxiosOptions = {
                    method: method,
                    url: `${baseUrl}${url}`,
                    headers: mergedHeaders,
                    data: body,
                    ...axiosOptions,
                };
                const axiosResponse = await (0, axios_1.default)(mergedAxiosOptions);
                res.writeHead(axiosResponse.status, axiosResponse.statusText, {
                    'Content-Type': 'application/json',
                    ...axiosResponse.headers,
                });
                res.end(JSON.stringify(axiosResponse.data));
            });
        }
        catch (error) {
            console.error('Error forwarding request:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
        }
    };
}
exports.createForwarder = createForwarder;
