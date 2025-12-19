import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['he', 'en', 'fr'];

export default getRequestConfig(async ({requestLocale}) => {
  // Await the locale from the request
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = 'fr'; // Default to French
  }

  return {
    locale,
    messages: (await import(`../i18n/${locale}.json`)).default
  };
});
