import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepo } from '../repositories/user.repo.js';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, franchiseId: user.franchise_id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export const authService = {
  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw ApiError.unauthorized('Invalid email or password');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await userRepo.updateRefreshToken(user.id, hashedRefresh);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      franchiseId: user.franchise_id,
      franchiseName: user.franchise_name,
      shortName: user.short_name,
      logoUrl: user.logo_url,
      primaryColor: user.primary_color,
    };

    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token missing');

    const hashed = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const user = await userRepo.findByRefreshToken(hashed);
    if (!user) throw ApiError.unauthorized('Invalid or expired refresh token');

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    const newHashed = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await userRepo.updateRefreshToken(user.id, newHashed);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    await userRepo.clearRefreshToken(userId);
  },

  async hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  },
};
