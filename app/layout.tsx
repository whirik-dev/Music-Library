import "./globals.css";
import HTML from "@/components/HTMLProvider";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default async function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
      <HTML locale={locale}>
        <body className="antialiased">
          <GoogleAnalytics />
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </body>
      </HTML>
    );
  }