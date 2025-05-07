import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI客服助手",
  description: "智能客服工单处理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
