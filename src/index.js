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
            const { method, url, body, params, headers } = req;
            const mergedHeaders = {
                ...axiosOptions.headers,
                ...headers,
            };
            const mergedAxiosOptions = {
                method: method,
                url: `${baseUrl}${url}`,
                headers: mergedHeaders,
                data: body,
                params,
                paramsSerializer: params => {
                    return new URLSearchParams(params).toString();
                },
                ...axiosOptions, // Include any custom options provided by the user
            };
            const axiosResponse = await (0, axios_1.default)(mergedAxiosOptions);
            res.status(axiosResponse.status).json(axiosResponse.data);
        }
        catch (error) {
            console.error('Error forwarding request:', error.message);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    };
}
exports.createForwarder = createForwarder;
