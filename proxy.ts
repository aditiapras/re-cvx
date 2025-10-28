import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPortalRoute = createRouteMatcher(["/portal(.*)"]);
const isAdmissionRoute = createRouteMatcher(["/admission(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPortalRoute(req)) {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.role as string | undefined;

    if (role !== "admin") {
      // Redirect non-admin users to admission or home
      return NextResponse.redirect(new URL("/admission", req.url));
    }

    if (isAdmissionRoute(req)) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
