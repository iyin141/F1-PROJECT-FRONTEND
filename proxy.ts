import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rewrite canonical standings endpoints to existing app routes.
 *
 * - /api/drivers/{year}/ -> /api/drivers/year/{year}/
 *
 * This avoids collisions with dynamic driver routes like /drivers/[driverCode]/
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const driverMatch = pathname.match(/^\/api\/drivers\/(\d{4})\/?$/);
  if (driverMatch) {
    const year = driverMatch[1];
    const url = req.nextUrl.clone();
    url.pathname = `/api/drivers/year/${year}/`;
    return NextResponse.rewrite(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/drivers/:year(\\d{4})',
    '/api/drivers/:year(\\d{4})/',
  ],
};
