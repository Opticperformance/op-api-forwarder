"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForwarder = void 0;
const axios_1 = __importDefault(require("axios"));
function createForwarder(baseUrl, axiosOptions = {}) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        const bodyAvailable = 'body' in req;
        const onEnd = (requestData) => __awaiter(this, void 0, void 0, function* () {
            const { method, url, headers } = req;
            const body = bodyAvailable ? req.body : JSON.parse(requestData || '{}');
            const mergedHeaders = Object.assign(Object.assign({}, axiosOptions.headers), headers);
            const mergedAxiosOptions = Object.assign({ method: method, url: `${baseUrl}${url}`, headers: mergedHeaders, data: body }, axiosOptions);
            try {
                const axiosResponse = yield (0, axios_1.default)(mergedAxiosOptions);
                res.writeHead(axiosResponse.status, axiosResponse.statusText, Object.assign({ 'Content-Type': 'application/json' }, axiosResponse.headers));
                res.end(JSON.stringify(axiosResponse.data));
            }
            catch (error) {
                if (error.response) {
                    const { status, statusText, headers, data } = error.response;
                    res.writeHead(status, statusText, Object.assign({ 'Content-Type': 'application/json' }, headers));
                    res.end(JSON.stringify(data));
                    return;
                }
                else {
                    console.error('Error forwarding request:', error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
                    return;
                }
            }
        });
        if (bodyAvailable) {
            onEnd();
        }
        else {
            let requestData = '';
            req.setEncoding('utf8');
            req.on('data', (chunk) => {
                requestData += chunk;
            });
            req.on('end', () => {
                onEnd(requestData);
            });
        }
    });
}
exports.createForwarder = createForwarder;
