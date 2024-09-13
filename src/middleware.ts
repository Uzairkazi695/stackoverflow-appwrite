import { NextResponse } from "next/server";
import getOrCreateDb from "./models/server/dbSetup";
import getOrCreateStorageCollection from "./models/server/storageSetup";

export async function middleware() {
  await Promise.all([getOrCreateDb(), getOrCreateStorageCollection()]);
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
