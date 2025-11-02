import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import { ROUTES } from "@/routes/route.constants";
import { AuthApi } from "@/apis/auth.api";
import { useAuthContext } from "@/contexts/auth-context";

const LoginSchema = z.object({
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type TLogin = z.infer<typeof LoginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<TLogin>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.ROOT);
    }
  };

  const onSubmit = async (values: TLogin) => {
    setError(null);
    try {
      const response = await AuthApi.login(values);
      const { token, user } = response.data.data;
      setAuth(user, token);

      if (user.role === "admin" || user.role === "staff") {
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.ROOT, { replace: true });
      }
    } catch (exception) {
      if (exception instanceof AxiosError) {
        const message = exception.response?.data?.message ?? "Email hoặc mật khẩu không đúng.";
        setError(message);
      } else {
        setError("Không thể đăng nhập. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 text-gray-600 hover:text-[#00CC66]"
        >
          <ChevronLeft className="h-4 w-4" />
          Trang chủ
        </Button>
      </div>

      {/* Layout: form (left) + banner (right on lg) */}
      <div className="grid min-h-screen grid-cols-1 items-center justify-center gap-0 px-4 py-12 lg:grid-cols-[minmax(0,520px),420px]">
        {/* Form card */}
        <Card className="w-full border border-gray-100 shadow-lg rounded-xl">
          <CardHeader className="space-y-3 text-center">
            {/* Logo above title */}
            <img src="/logo.jpg" alt="EVrent" className="mx-auto h-20 w-20 rounded-sm object-cover" />
            <CardTitle className="text-2xl font-bold text-[#000000]">Đăng nhập EVrent</CardTitle>
            <p className="text-sm text-gray-500">Sử dụng email và mật khẩu đã đăng ký.</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="focus:border-[#00CC66] focus:ring-[#00CC66]"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="focus:border-[#00CC66] focus:ring-[#00CC66]"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#00CC66] hover:bg-[#00b85c] text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="font-semibold text-[#00CC66] hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Banner image (right column on lg). Hidden on small screens */}
        <div className="hidden items-center justify-center lg:flex">
          <div className="w-full max-w-[420px]">
            <img
              src="/vf3bannermobile.jpg"
              alt="EVrent banner"
              className="h-full w-[80%] min-h-[420px] rounded-xl object-cover shadow-md border border-[#00CC66]/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
