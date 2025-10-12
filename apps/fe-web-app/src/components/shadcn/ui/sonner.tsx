import { useMediaQuery } from "@/hooks/use-media-query"; // Giả sử bạn đã có hook này
import { useTheme } from "next-themes";
import React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          transform: isMobile ? "scale(1)" : "scale(1.2)", // Giảm kích thước trên mobile
          transformOrigin: "top right",
          ...(isMobile && { right: "10px", top: "10px" }), // Điều chỉnh offset trên mobile
        } as React.CSSProperties
      }
      position={isMobile ? "top-center" : "top-right"} // Chuyển vị trí về giữa trên mobile
      offset={isMobile ? "10px" : undefined} // Thêm offset trên mobile
      {...props}
    />
  );
};

export { Toaster };
