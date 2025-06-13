import axios from "axios";

const baseURL = "https://dexter-backend-ucdt5.ondigitalocean.app/api/agent";

interface RegisterRequest {
  email: string;
  walletAddress?: string;
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
        message: error.response?.data?.message || "Registration failed",
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
      const { data } = await axios.post(`${baseURL}/api/auth/verify`, request);
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
}

export default AccessService;
