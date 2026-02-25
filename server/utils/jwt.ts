import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
)

export interface TokenPayload {
  userId: number;
}

export const generateAccessToken = async (payload: TokenPayload) => {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
}

export const generateRefreshToken = async (payload: TokenPayload) => {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload & { exp: number }
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
