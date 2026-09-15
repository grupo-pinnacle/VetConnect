import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.schemas';
import { AuthenticatedRequest } from './auth.middleware';

const authService = new AuthService();

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerSchema.parse(req.body);
      const { user, tokens } = await authService.register(validated);

      setRefreshCookie(res, tokens.refreshToken);

      const isMobile = req.headers['x-client-platform'] === 'mobile';

      res.status(201).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          ...(isMobile ? { refreshToken: tokens.refreshToken } : {}),
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, tokens } = await authService.login(validated);

      setRefreshCookie(res, tokens.refreshToken);

      const isMobile = req.headers['x-client-platform'] === 'mobile';

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          ...(isMobile ? { refreshToken: tokens.refreshToken } : {}),
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isMobile = req.headers['x-client-platform'] === 'mobile';
      let refreshToken = req.cookies.refreshToken;

      if (isMobile) {
        const bodyData = refreshSchema.parse(req.body);
        if (bodyData.refreshToken) {
          refreshToken = bodyData.refreshToken;
        }
      }

      const { user, tokens } = await authService.refresh(refreshToken);

      setRefreshCookie(res, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          ...(isMobile ? { refreshToken: tokens.refreshToken } : {}),
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.status(200).json({
        success: true,
        message: 'Sesion cerrada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user ? AuthService.sanitizeUser(req.user) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
