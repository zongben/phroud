"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = void 0;
const _internal_1 = require("../_internal");
class Responses {
    static OK(data) {
        return new _internal_1.JsonResponse(200, data);
    }
    static Created(data) {
        return new _internal_1.JsonResponse(201, data);
    }
    static Accepted(data) {
        return new _internal_1.JsonResponse(202, data);
    }
    static NoContent() {
        return new _internal_1.JsonResponse(204, null);
    }
    static BadRequest(error) {
        return new _internal_1.JsonResponse(400, error);
    }
    static Unauthorized(error) {
        return new _internal_1.JsonResponse(401, error);
    }
    static Forbidden(error) {
        return new _internal_1.JsonResponse(403, error);
    }
    static NotFound(error) {
        return new _internal_1.JsonResponse(404, error);
    }
    static Conflict(error) {
        return new _internal_1.JsonResponse(409, error);
    }
    static File(fileName, filePath) {
        return new _internal_1.FileResponse(fileName, filePath);
    }
    static Buffer(buffer, fileName, mimeType) {
        return new _internal_1.BufferResponse(buffer, fileName, mimeType);
    }
}
exports.Responses = Responses;
//# sourceMappingURL=index.js.map