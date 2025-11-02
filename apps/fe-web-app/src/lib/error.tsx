import type { BaseResponse } from "@/schema/common/response.type";
import { toast } from "sonner";

interface ApiError {
  response?: {
    status: number;
    data: {
      status?: number;
      message?: string;
      data?: string | Array<{ errorMessage: string }>;
    };
  };
  request?: unknown;
  message?: string;
}

export const handleApiError = (error: ApiError): BaseResponse<string> | null => {
  let handledError: BaseResponse<string> | null = null;

  if (error.response) {
    const { status, data } = error.response;
    if (status === 401) {
      handledError = {
        status: status,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        data: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    } else if (status === 403) {
      handledError = {
        status: status,
        message: "Bạn không có quyền truy cập vào tài nguyên này.",
        data: "Bạn không có quyền truy cập vào tài nguyên này.",
      };
    } else if (status === 400) {
      const errorMessage = Array.isArray(data.data)
        ? data.data[0]?.errorMessage
        : typeof data.data === 'string'
          ? data.data
          : "Dữ liệu không hợp lệ.";

      handledError = {
        status: status,
        message: "Dữ liệu không hợp lệ.",
        data: errorMessage,
      };
    } else if (data && data.status && data.message && data.data) {
      handledError = {
        status: data.status,
        message: data.message,
        data: typeof data.data === 'string' ? data.data : JSON.stringify(data.data),
      };
    } else {
      handledError = {
        status: status,
        message: data?.message || "Một lỗi không xác định đã xảy ra.",
        data: data?.message || "Một lỗi không xác định đã xảy ra.",
      };
    }
  } else if (error.request) {
    handledError = {
      status: 0,
      message: "Không nhận được phản hồi từ máy chủ.",
      data: "Không nhận được phản hồi từ máy chủ.",
    };
  } else {
    handledError = {
      status: 0,
      message: "Lỗi không xác định: " + (error.message || ""),
      data: "Lỗi không xác định: " + (error.message || ""),
    };
  }

  // Show toast notification with the error message
  if (handledError) {
    toast.error(handledError.message || "Đã xảy ra lỗi không xác định.", {
      duration: 5000,
      description: handledError.data ? String(handledError.data) : "Vui lòng thử lại sau.",
    });
  }

  return handledError;
};
