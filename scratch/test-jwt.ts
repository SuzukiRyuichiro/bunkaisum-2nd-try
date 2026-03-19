import { generateAccessToken, generateRefreshToken, verifyToken } from '../server/utils/jwt';

const token = await generateAccessToken({ userId: 1 });
console.log('Access token:\n', token);

const refreshToken = await generateRefreshToken({ userId: 1 });
console.log('\nRefresh token:\n', refreshToken);

const payload = await verifyToken(token);
console.log('\nDecoded payload:', payload);
