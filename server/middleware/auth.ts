import { verifyToken } from "~~/server/utils/jwt";

export default defineEventHandler(async (event) => {
  const path = event.path;

  if (!path.startsWith("/api") || path.startsWith("/api/auth")) {
    return;
  }

  const authHeader = getHeader(event, "authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, statusMessage: "Missing authorization header" });
  }

  const token = authHeader.slice(7);

  const payload = await verifyToken(token);
  event.context.user = payload;
});
