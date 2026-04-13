import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "星座 × MBTI 算命大师",
  description: "AI 驱动的搞笑命运预测",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
