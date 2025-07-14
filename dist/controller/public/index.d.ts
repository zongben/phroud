import { BufferResponse, FileResponse, JsonResponse } from "../_internal";
export declare class Responses {
    static OK<T = any>(data: T): JsonResponse;
    static Created<T = any>(data: T): JsonResponse;
    static Accepted<T = any>(data: T): JsonResponse;
    static NoContent(): JsonResponse;
    static BadRequest<T = any>(error: T): JsonResponse;
    static Unauthorized<T = any>(error: T): JsonResponse;
    static Forbidden<T = any>(error: T): JsonResponse;
    static NotFound<T = any>(error: T): JsonResponse;
    static Conflict<T = any>(error: T): JsonResponse;
    static File(fileName: string, filePath: string): FileResponse;
    static Buffer(buffer: Buffer, fileName: string, mimeType: string): BufferResponse;
}
//# sourceMappingURL=index.d.ts.map