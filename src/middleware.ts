import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  if (url.protocol === 'http:') {
    return Response.redirect(`https://${url.host}${url.pathname}${url.search}`, 301);
  }
  return next();
};
