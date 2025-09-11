import "./globals.css";
import HTML from "@/components/HTMLProvider";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

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
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </body>
      </HTML>
    );
  }