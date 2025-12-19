import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['he', 'en', 'fr'],

  // Used when no locale matches
  defaultLocale: 'fr',
  
  // Disable locale prefix for default locale
  localePrefix: 'as-needed'
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next`, `/_vercel`, `/dashboard`, `/auth`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|dashboard|auth|.*\\..*).*)']
};
