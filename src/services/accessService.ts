import axios from "axios";

const baseURL = "https://dexters-backend.zkcross.exchange";

interface RegisterRequest {
  email: string;
  walletAddress: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface AccessResponse {
  success: boolean;
  message: string;
  data?: any;
}
interface profilePayload {
  email: string;
  walletAddress: string;
  twitterProfile: string;
}
interface whitelistPayload {
  email: string;
  accessCode: string;
}

interface UserInfo {
  email: string;
  walletAddress: string;
  twitterProfile: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isWhitelisted: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface UserInfoResponse {
  success: boolean;
  data: {
    user: UserInfo;
  };
}

class AccessService {
  private static instance: AccessService;

  private constructor() {}

  public static getInstance(): AccessService {
    if (!AccessService.instance) {
      AccessService.instance = new AccessService();
    }
    return AccessService.instance;
  }

  /**
   * Register user for early access
   * @param request - Registration request containing email and optional wallet address
   * @returns Promise with registration response
   */
  async register(request: RegisterRequest): Promise<AccessResponse> {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/auth/register`,
        request
      );
      return {
        success: true,
        message: "Registration successful",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Sent OTP failed",
      };
    }
  }

  /**
   * Verify OTP for early access
   * @param request - Verification request containing email and OTP
   * @returns Promise with verification response
   */
  async verifyOtp(request: VerifyOtpRequest): Promise<AccessResponse> {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/auth/verify-otp`,
        request
      );
      return {
        success: true,
        message: "OTP verified successfully",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      };
    }
  }

  /**
   * Resend OTP for early access
   * @param email - User's email address
   * @returns Promise with resend response
   */
  async resendOtp(email: string): Promise<AccessResponse> {
    try {
      const { data } = await axios.post(`${baseURL}/api/auth/resend-otp`, {
        email,
      });
      return {
        success: true,
        message: "OTP resent successfully",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend OTP",
      };
    }
  }

  /**
   * Check early access status
   * @param email - User's email address
   * @returns Promise with access status
   */
  async checkAccessStatus(email: string): Promise<AccessResponse> {
    try {
      const { data } = await axios.get(`${baseURL}/api/auth/access-status`, {
        params: { email },
      });
      return {
        success: true,
        message: "Access status retrieved successfully",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to check access status",
      };
    }
  }

  async completeProfile(request: profilePayload): Promise<AccessResponse> {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/auth/complete-profile`,

        request
      );
      return {
        success: true,
        message: "OTP resent successfully",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend OTP",
      };
    }
  }
  async completeWhitelist(request: whitelistPayload): Promise<AccessResponse> {
    try {
      const { data } = await axios.post(
        `${baseURL}/api/auth/whitelist`,
        request
      );
      return {
        success: true,
        message: "OTP resent successfully",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend OTP",
      };
    }
  }

  /**
   * Get user information by wallet address
   * @param walletAddress - User's wallet address
   * @param authToken - Authentication token
   * @returns Promise with user information response
   */
  async getUserInfo(walletAddress: string, authToken: string): Promise<any> {
    try {
      const { data } = await axios.get(`${baseURL}/api/auth/user-info`, {
        params: { walletAddress },
        headers: { authorization: `Bearer ${authToken}` },
      });
      return {
        success: true,
        data: data.data,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            user: {
              email: "",
              walletAddress: "",
              twitterProfile: "",
              isEmailVerified: false,
              isProfileCompleted: false,
              isWhitelisted: false,
              lastLoginAt: "",
              createdAt: "",
            },
          },
        };
      } else {
        return {
          success: false,
          data: {
            user: {
              email: "",
              walletAddress: "",
              twitterProfile: "",
              isEmailVerified: false,
              isProfileCompleted: false,
              isWhitelisted: false,
              lastLoginAt: "",
              createdAt: "",
            },
          },
        };
      }
      throw error;
    }
  }
}

export default AccessService;
