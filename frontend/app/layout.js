import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "NeoConnect",
  description: "Staff Feedback and Complaint Management Platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
