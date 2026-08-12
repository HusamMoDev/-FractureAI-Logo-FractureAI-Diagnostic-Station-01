export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  /**
   * TODO: Replace mock login with real backend authentication API.
   * Currently, this just simulates a network request and always succeeds
   * for demonstration purposes.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!credentials.email) {
          reject(new Error("Email is required"));
          return;
        }

        // Mock response
        resolve({
          user: {
            id: 'u_123',
            name: 'Dr. S. Chen',
            email: credentials.email,
            role: 'Chief Radiologist',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9c4DjKn7sY4fba8WMrUkKG42LwG5zK3_rqudr8XFHAc27yvr-YMimNjzt_HKumorBy2o2TuOHzNMahfY1diaZSLZkckaWJnvymYwEs5Twj5BnYbrKQdH8Oxi3AtNtET9H4oSPpUgn0kGU2jq-gdCdLtUpaVYi56E5LvcmPa5Ar-uzXigEaUxdhHTfA_vO0G_dK8pbUdrTV_MsMQK3mksGU0txtf9mVY5eLo35Lbw6rbchEglvQL8exnQeA53dpTY7WIoMJwx56Sf2',
          },
          token: 'mock_jwt_token_12345',
        });
      }, 1500); // 1.5 seconds loading state
    });
  }

  /**
   * TODO: Connect to backend authentication API.
   * Mock register function.
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!userData.email || !userData.fullName) {
          reject(new Error("Email and Full Name are required"));
          return;
        }

        resolve({
          user: {
            id: 'u_new_123',
            name: userData.fullName,
            email: userData.email,
            role: 'Medical Staff',
          },
          token: 'mock_jwt_token_new_123',
        });
      }, 1500);
    });
  }

  /**
   * TODO: Connect to backend authentication API.
   * Mock forgot password function.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) {
          reject(new Error("Email is required"));
          return;
        }
        
        resolve({
          success: true,
          message: "Password reset instructions have been sent to your email.",
        });
      }, 1500);
    });
  }
}

export const authService = new AuthService();
