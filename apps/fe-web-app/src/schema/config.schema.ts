import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error(" Lỗi cấu hình ENV:", parsedEnv.error.format());
  throw new Error("Các giá trị khai báo trong file .env không hợp lệ");
}

export const envConfig = parsedEnv.data;
