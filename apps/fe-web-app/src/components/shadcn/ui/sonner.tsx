import { useTheme } from "next-themes";
import React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:shadow-lg',
          // Success toast - màu xanh lá nổi bật
          success: 'group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:border-green-700',
          // Error toast - màu đỏ nổi bật
          error: 'group-[.toast]:bg-red-600 group-[.toast]:text-white group-[.toast]:border-red-700',
          // Warning toast - màu vàng/cam nổi bật
          warning: 'group-[.toast]:bg-amber-600 group-[.toast]:text-white group-[.toast]:border-amber-700',
          // Info toast - màu xanh dương
          info: 'group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:border-blue-700',
          // Default toast
          default: 'group-[.toast]:bg-white group-[.toast]:text-gray-900 group-[.toast]:border-gray-200',
          // Description text
          description: 'group-[.toast]:text-white/90',
          // Action button
          actionButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30',
          // Cancel button
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20',
        },
      }}
      position="top-right"
      offset={16}
      {...props}
    />
  );
};

export { Toaster };
