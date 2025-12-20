import { supabase, supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            display_name: data.displayName || data.username,
          },
        },
      });

      if (authError) {
        logger.error('Supabase auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Check if user profile was created (via trigger)
      // Wait a bit for the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        logger.error('Error fetching user profile:', profileError);
      }

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        logger.error('Supabase auth login error:', authError);
        throw authError;
      }

      if (!authData.user || !authData.session) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        logger.warn('Error fetching user profile:', profileError);
      }

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken: string) {
    try {
      const { error } = await supabase.auth.admin.signOut(accessToken);

      if (error) {
        logger.error('Logout error:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        logger.error('Token refresh error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get user by access token
   */
  async getUserByToken(accessToken: string) {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (error) {
        logger.error('Get user error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('User not found');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        logger.warn('Error fetching user profile:', profileError);
      }

      return {
        user: data.user,
        profile,
      };
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
