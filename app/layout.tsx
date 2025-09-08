import "./globals.css";
import HTML from "@/components/HTMLProvider";
import {NextIntlClientProvider} from 'next-intl';

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <HTML>
        <body className="antialiased">
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </body>
      </HTML>
    );
  }