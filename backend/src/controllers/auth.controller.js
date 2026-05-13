import { authService } from '../services/auth.service.js';
import { userRepo } from '../repositories/user.repo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    new ApiResponse(200, { user, accessToken }, 'Login successful').send(res);
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    new ApiResponse(200, null, 'Logged out successfully').send(res);
  }),

  refresh: asyncHandler(async (req, res) => {
    const rawToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(rawToken);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await userRepo.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const safeUser = {
      id: user.id, name: user.name, email: user.email, role: user.role,
      franchiseId: user.franchise_id, franchiseName: user.franchise_name,
      shortName: user.short_name, logoUrl: user.logo_url, primaryColor: user.primary_color,
    };
    new ApiResponse(200, safeUser).send(res);
  }),
};
