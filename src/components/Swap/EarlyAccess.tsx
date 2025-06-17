import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import AccessService from "../../services/accessService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoginContext } from "@/context/LoginContext";
import { toastError, toastSuccess } from "@/utils/toast";
import { useActionContext } from "@/context/ActionContext";
import DexterAccessChecklist from "./DexterAccessChecklist";

const accessService = AccessService.getInstance();

interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "active" | "inactive";
  buttonText?: string;
  buttonAction?: () => void;
}

interface EarlyAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const EarlyAccess: React.FC<EarlyAccessProps> = ({ isOpen, onClose }) => {
  const { userProfile, address, setUerProfile } = useLoginContext();
  const { authToken } = useActionContext();
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isOtpValid, setIsOtpValid] = useState<boolean | null>(null);
  const [twitterProfile, setTwitterProfile] = useState("");
  const [isSecuring, setIsSecuring] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Registration",
      description: "Complete your registration process",
      status: "completed",
    },
    {
      id: 2,
      title: "Follow Dexter on X",
      description: "Stay updated with our latest news",
      status: "active",
      buttonText: "Follow",
      buttonAction: () => handleStepAction(2),
    },
    {
      id: 3,
      title: "Like & share the pinned post",
      description: "Help us grow our community",
      status: "inactive",
      buttonText: "Share",
      buttonAction: () => handleStepAction(3),
    },
    {
      id: 4,
      title: "Watch for the X post & access email",
      description: "We'll notify you when you're approved",
      status: "inactive",
    },
  ]);

  const handleStepAction = useCallback((stepId: number) => {
    switch (stepId) {
      case 2:
        window.open("https://twitter.com/dexter", "_blank");
        break;
      case 3:
        window.open("https://twitter.com/dexter/status/123456789", "_blank");
        break;
      default:
        break;
    }
  }, []);

  // Initialize state when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.isEmailVerified) {
        setEmail(userProfile.email);
        setIsOtpValid(true);
      }
      if (userProfile.isProfileCompleted) {
        setTwitterProfile(userProfile.twitterProfile);
        setShowInviteCode(true);
      }
    }
  }, [userProfile]);

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Initialize dialog state when isOpen prop changes
  useEffect(() => {
    if (isOpen) {
      setIsDialogOpen(true);
    } else {
      const timer = setTimeout(() => {
        setIsDialogOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEmail("");
      setOtp("");
      setIsOtpSent(false);
      setIsVerifying(false);
      setCountdown(0);
      setIsOtpValid(null);
      setTwitterProfile("");
      setIsSecuring(false);
      setInviteCode("");
      setPrivateKey("");
      setShowPrivateKey(false);
      setShowChecklist(false);
    }
  }, [isDialogOpen]);

  const handleSendOtp = useCallback(async () => {
    if (!email) {
      toastError("Please enter your email");
      return;
    }

    if (!address) {
      toastError("Please connect your wallet first");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastError("Please enter a valid email address");
      return;
    }

    try {
      setIsSendingOtp(true);
      setIsOtpSent(false); // Reset OTP sent state
      const response = await accessService.register({
        email,
        walletAddress: address,
      });

      if (response.success) {
        setIsOtpSent(true);
        setCountdown(60);
        toastSuccess("OTP sent successfully");
      } else {
        toastError(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        toastError(error.response.data.message);
      } else {
        toastError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  }, [email, address]);

  const handleResendOtp = async () => {
    try {
      await accessService.resendOtp(email);
      setCountdown(60);
      toast.success("OTP resent successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (!otp) {
      toastError("Please enter the OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await accessService.verifyOtp({
        email,
        otp,
      });

      if (response.success) {
        setIsOtpValid(true);
        toastSuccess("Email verified successfully");

        // Fetch updated user info
        if (authToken && address) {
          const userInfo = await accessService.getUserInfo(address, authToken);
          if (userInfo.success) {
            setUerProfile(userInfo.data.user);
          }
        }
      } else {
        toastError(response.message);
      }
    } catch (error) {
      toastError("Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  }, [otp, email, authToken, address, setUerProfile]);

  const handleSecureSpot = useCallback(async () => {
    if (!email || !address || !twitterProfile) {
      toastError("Please fill in all required fields");
      return;
    }

    if (!isOtpValid) {
      toastError("Please verify your email first");
      return;
    }

    setIsSecuring(true);
    try {
      const response = await accessService.completeProfile({
        email,
        walletAddress: address,
        twitterProfile,
      });

      if (response.success) {
        toastSuccess("Profile completed successfully");
        setShowChecklist(true);

        // // Fetch updated user info
        // if (authToken && address) {
        //   const userInfo = await accessService.getUserInfo(address, authToken);
        //   if (userInfo.success) {
        //     setUerProfile(userInfo.data.user);
        //   }
        // }
      } else {
        toastError(response.message);
      }
    } catch (error) {
      toastError("Failed to complete profile");
    } finally {
      setIsSecuring(false);
    }
  }, [email, address, twitterProfile, isOtpValid, authToken, setUerProfile]);

  const handleWhitelist = useCallback(async () => {
    if (!inviteCode || !privateKey) {
      toastError("Please fill in all required fields");
      return;
    }

    setIsSecuring(true);
    try {
      const response = await accessService.completeWhitelist({
        email,
        accessCode: inviteCode,
        privateKey,
      });

      if (response.success) {
        toastSuccess("Whitelist completed successfully");

        // Fetch updated user info
        if (authToken && address) {
          const userInfo = await accessService.getUserInfo(address, authToken);
          if (userInfo.success) {
            setUerProfile(userInfo.data.user);
          }
        }
      } else {
        toastError(response.message);
      }
    } catch (error) {
      toastError("Failed to complete whitelist");
    } finally {
      setIsSecuring(false);
    }
  }, [email, inviteCode, privateKey, authToken, address, setUerProfile]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Transition.Root show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose} static>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 py-4">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-[940px] h-[640px] flex flex-row transform overflow-hidden rounded-2xl border border-primary-100 backdrop-blur-sm bg-black/25 drop-shadow-lg ring-1 ring-primary-100/20 focus:outline-none text-left align-middle shadow-xl transition-all">
                  {/* Left Section - Image */}
                  <div className="w-1/2 border-r rounded-e-3xl border-primary-100 relative">
                    <img
                      src="/Login/DexterWhitelist.png"
                      alt="Early Access"
                      className="absolute inset-0 w-full h-full object-cover rounded-e-3xl"
                    />
                  </div>

                  {/* Right Section - Content */}
                  <div className="w-1/2 bg-black/20 relative">
                    {/* Header */}
                    <div className="border-b border-primary-100 py-6 flex flex-col justify-center items-center relative">
                      <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <h4 className="text-primary-100 text-xl font-bold">
                        Enter Dexter's Lab Early
                      </h4>
                      <p className="text-white text-base font-medium">
                        Join the limited whitelist to unlock exclusive access
                      </p>
                    </div>

                    {/* Content Section */}
                    <div className="py-7 px-20 space-y-3">
                      {!showChecklist ? (
                        <>
                          {/* Email Field */}
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">
                              Your email address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 bg-transparent border ${
                                  userProfile?.isEmailVerified
                                    ? "border-green-500"
                                    : "border-primary-100/40"
                                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100`}
                                disabled={userProfile?.isEmailVerified}
                              />
                              {userProfile?.isEmailVerified && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-green-500">
                                  Verified
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Verification Code Field - Only show if email not verified */}
                          {!userProfile?.isEmailVerified && (
                            <div className="space-y-2">
                              <label className="text-white text-sm font-medium">
                                Email verification code
                              </label>
                              <div className="relative">
                                <input
                                  id="otp-input"
                                  type="text"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  placeholder="6-digits verification code"
                                  className={`w-full px-4 py-3 bg-transparent border ${
                                    isOtpValid === true
                                      ? "border-green-500"
                                      : isOtpValid === false
                                      ? "border-red-500"
                                      : "border-primary-100/40"
                                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100`}
                                />
                                {!isOtpSent ? (
                                  <button
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSendingOtp ? (
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="animate-spin h-4 w-4"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          />
                                        </svg>
                                        <span>Sending...</span>
                                      </div>
                                    ) : (
                                      "Send"
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={handleVerifyOtp}
                                    disabled={otp.length !== 6 || isVerifying}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 ${
                                      otp.length === 6
                                        ? "text-primary-100 hover:bg-primary-100/10"
                                        : "text-gray-500 cursor-not-allowed"
                                    } rounded transition-colors`}
                                  >
                                    {isVerifying ? "Verifying..." : "Verify"}
                                  </button>
                                )}
                              </div>
                              {isOtpSent && (
                                <div className="flex justify-end">
                                  {countdown > 0 ? (
                                    <span className="text-gray-400 text-xs">
                                      Resend in {countdown}s
                                    </span>
                                  ) : (
                                    <button
                                      onClick={handleResendOtp}
                                      className="text-primary-100 hover:text-primary-100/80 text-xs transition-colors"
                                    >
                                      Resend OTP
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* X Account Connection */}
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">
                              Connect X
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={twitterProfile}
                                onChange={(e) =>
                                  setTwitterProfile(e.target.value)
                                }
                                placeholder="Enter your Twitter/X profile URL"
                                className={`w-full px-4 py-3 bg-transparent border ${
                                  userProfile?.isProfileCompleted
                                    ? "border-green-500"
                                    : "border-primary-100/40"
                                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100`}
                                disabled={userProfile?.isProfileCompleted}
                              />
                            </div>
                          </div>

                          {/* Invite Code Section - Always show if profile is completed */}
                          <div className="space-y-2">
                            {!showInviteCode &&
                              !userProfile?.isProfileCompleted && (
                                <button
                                  onClick={() =>
                                    setShowInviteCode(!showInviteCode)
                                  }
                                  className="text-gray-400 text-sm font-medium transition-colors"
                                >
                                  Got an exclusive invite code?
                                  <span className="text-white hover:text-primary-100/80">
                                    {" "}
                                    Click Here!
                                  </span>
                                </button>
                              )}
                            {(showInviteCode ||
                              userProfile?.isProfileCompleted) && (
                              <div className="relative space-y-4">
                                <div className="space-y-2">
                                  <label className="text-white text-sm font-medium">
                                    Exclusive access code
                                  </label>
                                  <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) =>
                                      setInviteCode(e.target.value)
                                    }
                                    placeholder="Enter your access code"
                                    className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                                  />
                                </div>

                                {userProfile?.isProfileCompleted && (
                                  <div className="space-y-2">
                                    <label className="text-white text-sm font-medium">
                                      Private Key
                                    </label>
                                    <div className="relative">
                                      <input
                                        type={
                                          showPrivateKey ? "text" : "password"
                                        }
                                        value={privateKey}
                                        onChange={(e) =>
                                          setPrivateKey(e.target.value)
                                        }
                                        placeholder="Enter your private key"
                                        className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                                      />
                                      <button
                                        onClick={() =>
                                          setShowPrivateKey(!showPrivateKey)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                      >
                                        {showPrivateKey ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                              fillRule="evenodd"
                                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                              clipRule="evenodd"
                                            />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Secure Your Spot button */}
                          <div className="relative w-full flex justify-center items-center py-4">
                            <button
                              onClick={
                                userProfile?.isProfileCompleted
                                  ? handleWhitelist
                                  : handleSecureSpot
                              }
                              disabled={
                                isSecuring ||
                                (userProfile?.isProfileCompleted
                                  ? !inviteCode || !privateKey
                                  : !userProfile?.isEmailVerified ||
                                    !twitterProfile)
                              }
                              className={`px-10 py-3 bg-primary-100 text-black font-bold rounded-lg transition-colors ${
                                isSecuring ||
                                (userProfile?.isProfileCompleted
                                  ? !inviteCode || !privateKey
                                  : !userProfile?.isEmailVerified ||
                                    !twitterProfile)
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-primary-100/90"
                              }`}
                            >
                              {isSecuring ? (
                                <div className="flex items-center space-x-2">
                                  <svg
                                    className="animate-spin h-5 w-5"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>
                                    {userProfile?.isProfileCompleted
                                      ? "Whitelisting..."
                                      : "Securing..."}
                                  </span>
                                </div>
                              ) : userProfile?.isProfileCompleted ? (
                                "Get Whitelisted"
                              ) : (
                                "Secure Your Spot"
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <DexterAccessChecklist
                          steps={steps}
                          showSuccess={true}
                        />
                      )}
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default EarlyAccess;
