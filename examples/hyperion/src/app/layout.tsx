import { HyperionSDKProvider } from "@/components/HyperionSDKProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { WalletProvider } from "../components/WalletProvider";
import { AutoConnectProvider } from "../components/AutoConnectProvider";
import { WagmiProviderWrapper } from "@/components/providers/WagmiProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyperion SDK Demo",
  description: "Hyperion SDK Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HyperionSDKProvider>
          <AutoConnectProvider>
            <WagmiProviderWrapper>
              <WalletProvider>{children}</WalletProvider>
            </WagmiProviderWrapper>
          </AutoConnectProvider>
        </HyperionSDKProvider>
        <Toaster />
      </body>
    </html>
  );
}
