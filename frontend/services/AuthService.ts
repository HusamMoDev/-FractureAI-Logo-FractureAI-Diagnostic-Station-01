import { supabase } from '../lib/supabase';

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  clinicId?: string;
  specialty?: string;
  active?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  requiresEmailConfirmation?: boolean;
  requiresApproval?: boolean;
  message?: string;
}

export class AuthOperationError extends Error {
  code?: string;
  status?: number;
  originalMessage?: string;

  constructor(
    message: string,
    details?: { code?: string; status?: number; originalMessage?: string }
  ) {
    super(message);
    this.name = 'AuthOperationError';
    this.code = details?.code;
    this.status = details?.status;
    this.originalMessage = details?.originalMessage;
  }
}

class AuthService {
  private isRegistering = false;
  /**
   * Convert Supabase profile data into the application's User object.
   */
  private mapProfileToUser(
    authUser: {
      id: string;
      email?: string | null;
    },
    profile: {
      id: string;
      id_clinic: string | null;
      name_full: string;
      role: string;
      specialty: string | null;
      active_is: boolean;
      path_avatar: string | null;
    }
  ): User {
    return {
      id: authUser.id,
      name: profile.name_full,
      email: authUser.email ?? '',
      role: profile.role,
      avatar: profile.path_avatar ?? undefined,
      clinicId: profile.id_clinic ?? undefined,
      specialty: profile.specialty ?? undefined,
      active: profile.active_is,
    };
  }

  /**
   * Load the application profile associated with the authenticated user.
   */
  private async getProfile(authUserId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        id_clinic,
        name_full,
        role,
        specialty,
        active_is,
        path_avatar
      `
      )
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Profile loading error:', error);
      throw new Error('Unable to load user profile.');
    }

    return data;
  }

  /**
   * Validate a profile for APPLICATION ACCESS.
   *
   * This is intentionally NOT used during registration.
   * New users are created as inactive and without a clinic.
   */
  private async validateProfile(
    authUser: {
      id: string;
      email?: string | null;
    }
  ): Promise<User> {
    const profile = await this.getProfile(authUser.id);

    if (!profile) {
      await supabase.auth.signOut();

      throw new Error(
        'Your account profile has not been created yet. Please contact the administrator.'
      );
    }

    if (!profile.active_is) {
      await supabase.auth.signOut();

      throw new Error(
        'Your account is waiting for administrator approval.'
      );
    }

    if (!profile.id_clinic) {
      await supabase.auth.signOut();

      throw new Error(
        'Your account has not been assigned to a clinic yet.'
      );
    }

    return this.mapProfileToUser(authUser, profile);
  }

  /**
   * Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password ?? '';

    if (!email) {
      throw new Error('Please enter your email address.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    /**
     * Remember Me preference.
     * Storage behavior is handled by lib/supabase.ts.
     */
    if (credentials.rememberMe) {
      localStorage.setItem('fractureai_remember_me', 'true');
    } else {
      localStorage.removeItem('fractureai_remember_me');
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[Supabase Auth Login Error]', {
          status: error.status,
          code: error.code,
          message: error.message,
          name: error.name,
        });
      }

      throw new AuthOperationError(
        this.getAuthErrorMessage(error),
        {
          code: error.code,
          status: error.status,
          originalMessage: error.message,
        }
      );
    }

    if (!data.user) {
      throw new Error(
        'Login failed. No authenticated user was returned.'
      );
    }

    try {
      /**
       * IMPORTANT:
       * active_is and id_clinic are checked here,
       * not during registration.
       */
      const user = await this.validateProfile(data.user);

      return {
        user,
        token: data.session?.access_token ?? null,
        requiresEmailConfirmation: false,
        requiresApproval: false,
        message: 'Login successful.',
      };
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
  }

  /**
   * Register a new account.
   *
   * New accounts are intentionally created as:
   * active_is = false
   * id_clinic = null
   *
   * This is NOT an error.
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (this.isRegistering) {
      throw new AuthOperationError(
        'A registration request is already in progress. Please wait a moment.'
      );
    }

    this.isRegistering = true;

    try {
      const fullName = data.fullName.trim();
      const email = data.email.trim().toLowerCase();
      const password = data.password ?? '';

      if (!fullName) {
        throw new AuthOperationError('Please enter your full name.');
      }

      if (!email) {
        throw new AuthOperationError('Please enter your email address.');
      }

      if (!password) {
        throw new AuthOperationError('Please enter a password.');
      }

      if (password.length < 6) {
        throw new AuthOperationError(
          'Password must contain at least 6 characters.'
        );
      }

      const { data: signUpData, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[Supabase Auth Registration Error]', {
            status: error.status,
            code: error.code,
            message: error.message,
            name: error.name,
          });
        }

        const userFriendlyMessage = this.getAuthErrorMessage(error);
        throw new AuthOperationError(userFriendlyMessage, {
          code: error.code,
          status: error.status,
          originalMessage: error.message,
        });
      }

      if (!signUpData.user) {
        throw new AuthOperationError(
          'Registration could not be completed. Please try again.'
        );
      }

      /**
       * The database trigger has already created the profile.
       *
       * Expected new-user state:
       *
       * role       = technician
       * active_is  = false
       * id_clinic  = null
       *
       * This is the CORRECT state for a newly registered user.
       */

      /**
       * If Supabase immediately created a session,
       * sign it out because the account still needs
       * administrator approval.
       */
      if (signUpData.session) {
        await supabase.auth.signOut();
      }

      return {
        user: null,
        token: null,
        requiresEmailConfirmation: !signUpData.session,
        requiresApproval: true,
        message:
          'Account created successfully. Please wait for administrator approval before logging in.',
      };
    } finally {
      this.isRegistering = false;
    }
  }

  /**
   * Send password reset email.
   */
  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error(
        'Please enter your email address.'
      );
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail
      );

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[Supabase Auth Password Reset Error]', {
          status: error.status,
          code: error.code,
          message: error.message,
          name: error.name,
        });
      }

      throw new AuthOperationError(
        this.getAuthErrorMessage(error),
        {
          code: error.code,
          status: error.status,
          originalMessage: error.message,
        }
      );
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const { error } =
      await supabase.auth.signOut();

    localStorage.removeItem(
      'fractureai_remember_me'
    );

    if (error) {
      console.error('Logout error:', error);

      throw new Error(
        this.getAuthErrorMessage(error.message)
      );
    }
  }

  /**
   * Get the currently authenticated application user.
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    try {
      return await this.validateProfile(authUser);
    } catch (error) {
      console.error(
        'Current user validation error:',
        error
      );

      return null;
    }
  }

  /**
   * Listen for authentication state changes.
   */
  onAuthStateChange(
    callback: (user: User | null) => void
  ) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        /**
         * Defer database access so we do not perform
         * Supabase queries directly inside the auth callback.
         */
        setTimeout(async () => {
          if (!session?.user) {
            callback(null);
            return;
          }

          try {
            const user =
              await this.validateProfile(
                session.user
              );

            callback(user);
          } catch (error) {
            console.error(
              `Auth state validation error (${event}):`,
              error
            );

            callback(null);
          }
        }, 0);
      }
    );

    return subscription;
  }

  /**
   * Convert common Supabase authentication errors
   * into user-friendly messages.
   */
  private getAuthErrorMessage(
    errorOrMessage:
      | { message?: string; status?: number; code?: string }
      | string
  ): string {
    const rawMessage =
      typeof errorOrMessage === 'object' && errorOrMessage?.message
        ? String(errorOrMessage.message)
        : typeof errorOrMessage === 'string'
        ? errorOrMessage
        : '';

    const code =
      typeof errorOrMessage === 'object' && errorOrMessage?.code
        ? String(errorOrMessage.code).toLowerCase()
        : '';

    const status =
      typeof errorOrMessage === 'object' &&
      typeof errorOrMessage?.status === 'number'
        ? errorOrMessage.status
        : null;

    const normalizedMessage = rawMessage.toLowerCase();

    if (
      status === 429 ||
      code === 'over_email_send_rate_limit' ||
      code.includes('rate_limit') ||
      normalizedMessage.includes('rate limit') ||
      normalizedMessage.includes('over_email_send_rate_limit')
    ) {
      return 'Email delivery is temporarily limited due to high request volume. Please wait a while before requesting another registration or verification email.';
    }

    if (
      normalizedMessage.includes(
        'invalid login credentials'
      ) ||
      normalizedMessage.includes(
        'invalid credentials'
      )
    ) {
      return 'Incorrect email or password.';
    }

    if (
      normalizedMessage.includes(
        'email not confirmed'
      )
    ) {
      return 'Please confirm your email address before logging in.';
    }

    if (
      normalizedMessage.includes(
        'user already registered'
      )
    ) {
      return 'An account with this email already exists.';
    }

    if (
      normalizedMessage.includes(
        'password should be at least'
      )
    ) {
      return 'Password must contain at least 6 characters.';
    }

    if (
      normalizedMessage.includes('email')
    ) {
      return 'Please check the email address and try again.';
    }

    return (
      rawMessage ||
      'Authentication failed. Please try again.'
    );
  }
}

export const authService = new AuthService();