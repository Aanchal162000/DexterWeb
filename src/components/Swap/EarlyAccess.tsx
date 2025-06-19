import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import AccessService from "../../services/accessService";
import { toast } from "react-toastify";
import { useLoginContext } from "@/context/LoginContext";
import { toastError, toastSuccess } from "@/utils/toast";
import { useActionContext } from "@/context/ActionContext";
import DexterAccessChecklist from "./DexterAccessChecklist";
import { ShowerHead } from "lucide-react";
import axios from "axios";
import { RiTwitterXLine } from "react-icons/ri";

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
  const { userProfile, address, setUerProfile, setIsWhitelisted } =
    useLoginContext();
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
  const [showChecklist, setShowChecklist] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      buttonAction: () => {
        window.open("https://x.com/DextersLabAI", "_blank");
        setSteps((prevSteps) => {
          const newSteps = [...prevSteps];
          newSteps[1] = {
            ...newSteps[1],
            buttonText: "loading",
            status: "active",
          };
          return newSteps;
        });
        // Simulate tracking for 15 seconds
        setTimeout(() => {
          handleStepAction(2);
        }, 15000);
      },
    },
    {
      id: 3,
      title: "Like & share the pinned post",
      description: "Help us grow our community",
      status: "inactive",
      buttonText: "Share",
      buttonAction: () => {
        window.open("https://x.com/DextersLabAI", "_blank");
        setSteps((prevSteps) => {
          const newSteps = [...prevSteps];
          newSteps[2] = {
            ...newSteps[2],
            buttonText: "loading",
            status: "active",
          };
          return newSteps;
        });
        // Simulate tracking for 15 seconds
        setTimeout(() => {
          handleStepAction(3);
        }, 15000);
      },
    },
    {
      id: 4,
      title: "Watch for the X post & access email",
      description: "We'll notify you when you're approved",
      status: "inactive",
    },
  ]);

  const handleStepAction = (stepId: number) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      const currentStepIndex = newSteps.findIndex((step) => step.id === stepId);

      // Update current step to completed
      newSteps[currentStepIndex] = {
        ...newSteps[currentStepIndex],
        status: "completed",
        buttonText: undefined,
        buttonAction: undefined,
      };

      // If there's a next step, update it to active after delay
      if (currentStepIndex < newSteps.length - 1) {
        setTimeout(() => {
          setSteps((prevSteps) => {
            const updatedSteps = [...prevSteps];
            const nextStep = updatedSteps[currentStepIndex + 1];
            updatedSteps[currentStepIndex + 1] = {
              ...nextStep,
              status: "active",
              buttonText: nextStep.buttonText,
              buttonAction: nextStep.buttonAction,
            };

            // If this is the last step becoming active, show success after 2 seconds
            if (currentStepIndex + 1 === newSteps.length - 1) {
              setTimeout(() => {
                setShowSuccess(true);
              }, 2000);
            }

            return updatedSteps;
          });
        }, 1000); // 15 seconds delay
      }

      return newSteps;
    });
  };

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
      setShowChecklist(false);
      setShowSuccess(false);
    }
  }, [isDialogOpen]);

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
    if (!inviteCode) {
      toastError("Please fill in all required fields");
      return;
    }

    setIsSecuring(true);
    try {
      const response = await accessService.completeWhitelist({
        email,
        accessCode: inviteCode,
      });

      if (response.success) {
        toastSuccess("Whitelist completed successfully");

        // Fetch updated user info
        if (authToken && address) {
          const userInfo = await accessService.getUserInfo(address, authToken);
          if (userInfo.success) {
            setUerProfile(userInfo.data.user);
            setIsWhitelisted(true);
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
  }, [email, inviteCode, authToken, address, setUerProfile]);

  const getTwitterAuthAPI = async () => {
    if (!authToken) {
        toastError("Authentication failed. Retry login!");
        return;
    }
    const baseUrl = "https://dexters-backend.zkcross.exchange";
    const response = await axios.get(`${baseUrl}/api/auth/twitter/auth/link`, {
      headers: { authorization: `Bearer ${authToken}`, "ngrok-skip-browser-warning": "true" },
    });
    // window.open(response.data?.data?.url, "_self");
    const popup = window.open(
      response.data?.data?.url,
      'twitter-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        toastError("Twitter authentication cancelled!!");
      }
    }, 1000);

    const onMessage = (event: MessageEvent) => {
      if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
        // Update UI immediately - no page refresh needed!
        // console.log("event.data.data.user", event.data.data.user);
        setUerProfile(event.data.data.user);
        toastSuccess("Twitter linked successfully");
        window.removeEventListener('message', onMessage);
        clearInterval(checkClosed);
        popup?.close();
      }
    };

    window.addEventListener('message', onMessage);
};

  return (
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
                <div ref={containerRef} className="w-1/2 bg-black/20 relative">
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
                  {!showChecklist ? (
                    <div className="py-7 px-20 space-y-3">
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
                                className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 ${
                                  !isSendingOtp && "animate-blinker"
                                } text-primary-100 hover:bg-primary-100/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                } ${
                                  otp.length === 6 &&
                                  !isVerifying &&
                                  "animate-blinker"
                                }  rounded transition-colors`}
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
                        {userProfile?.isProfileCompleted ?
                        <div className="relative">
                          <input
                            type="text"
                            value={twitterProfile}
                            onChange={(e) => setTwitterProfile(e.target.value)}
                            placeholder="Enter your Twitter/X profile URL"
                            className={`w-full px-4 py-3 bg-transparent border ${
                              userProfile?.isProfileCompleted
                                ? "border-green-500"
                                : "border-primary-100/40"
                            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100`}
                            disabled={true}
                          />
                        </div> :
                        <button onClick={getTwitterAuthAPI} className="text-zinc-300 text-base transition-colors py-2.5 px-3 w-full bg-gradient-to-r from-black/60 to-transparent rounded-lg flex items-center justify-center border border-primary-100/40">
                          Link your X account
                          <RiTwitterXLine className="text-zinc-300 ml-auto size-7" />
                        </button>}
                      </div>

                      {/* Invite Code Section - Always show if profile is completed */}
                      <div className="space-y-2">
                        {!showInviteCode &&
                          !userProfile?.isProfileCompleted && (
                            <button
                              onClick={() => setShowInviteCode(!showInviteCode)}
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
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Enter your access code"
                                className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                              />
                            </div>
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
                              ? !inviteCode
                              : !userProfile?.isEmailVerified ||
                                !twitterProfile)
                          }
                          className={`px-10 py-3 bg-primary-100 text-black font-bold rounded-lg transition-colors ${
                            isSecuring ||
                            (userProfile?.isProfileCompleted
                              ? !inviteCode
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
                    </div>
                  ) : (
                    <div className="py-7 px-14 space-y-3">
                      <DexterAccessChecklist
                        steps={steps}
                        showSuccess={showSuccess}
                        containerRef={containerRef}
                      />
                    </div>
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EarlyAccess;
