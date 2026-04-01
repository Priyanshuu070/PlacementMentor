import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "PlacementMentor - Resume Analysis & Mock Interviews",
  description: "Ace your placement interviews with AI-powered resume analysis and realistic mock interview sessions. Perfect skill gap analysis and placement readiness reports.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
