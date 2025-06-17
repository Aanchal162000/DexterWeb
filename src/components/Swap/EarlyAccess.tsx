import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import WalletSelect from "./WalletSelect";
import DexterAccessChecklist from "./DexterAccessChecklist";
import AccessService from "@/services/accessService";
import { useLoginContext } from "@/context/LoginContext";
import { formatAddress } from "@/utils/helper";

interface EarlyAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

type StepStatus = "completed" | "active" | "inactive";

interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  buttonText?: string;
  buttonAction?: () => void;
}

const EarlyAccess: React.FC<EarlyAccessProps> = ({ isOpen, onClose }) => {
  const { connectWallet, address, setIsWhitelisted } = useLoginContext();
  const [selectedWallet, setSelectedWallet] = useState("");
  const [isInviteCodeVisible, setIsInviteCodeVisible] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [twitterUrl, setTwitterUrl] = useState("");
  const [isTwitterUrlValid, setIsTwitterUrlValid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isInviteCodeFlow, setIsInviteCodeFlow] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [showEnterLab, setShowEnterLab] = useState(false);
  const [isWhitelistedLocal, setIsWhitelistedLocal] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const twitterUrlPattern =
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}$/;
  const accessService = AccessService.getInstance();

  // Reset verification state when email changes
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (emailPattern.test(newEmail)) {
      try {
        const response = await accessService.getUserInfo(newEmail);
        if (response.success) {
          const { user } = response.data;

          // If user is already whitelisted
          if (user.isWhitelisted) {
            setIsWhitelistedLocal(true);
            // Show only email and wallet connection
            setIsInviteCodeFlow(false);
            return;
          }

          // If user has verified email and completed profile but not whitelisted
          if (
            user.isEmailVerified &&
            user.isProfileCompleted &&
            !user.isWhitelisted
          ) {
            setIsOtpVerified(true);
            setIsTwitterConnected(true);
            setTwitterUrl(user.twitterProfile);
            if (user.walletAddress) {
              setSelectedWallet("metamask");
              handleWalletChange("metamask");
            }
            setIsInviteCodeVisible(true);
            return;
          }

          // If user has verified email but not completed profile
          if (user.isEmailVerified && !user.isProfileCompleted) {
            setIsOtpVerified(true);
            if (user.walletAddress) {
              setSelectedWallet("metamask");
              handleWalletChange("metamask");
            }
            if (user.twitterProfile) {
              setIsTwitterConnected(true);
              setTwitterUrl(user.twitterProfile);
            }
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }

    // Reset verification states if email is invalid or no user info found
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp("");
    setTimer(0);
    setError("");
    setShowEnterLab(false);
    setIsWhitelistedLocal(false);
  };

  // Add effect to handle whitelist status when wallet connects
  useEffect(() => {
    if (address && isWhitelistedLocal) {
      setShowEnterLab(true);
    } else {
      setShowEnterLab(false);
    }
  }, [address, isWhitelistedLocal]);

  useEffect(() => {
    setIsEmailValid(emailPattern.test(email));
  }, [email]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await accessService.register({ email });
      if (response.success) {
        setIsOtpSent(true);
        setTimer(60);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await accessService.verifyOtp({ email, otp });
      if (response.success) {
        setIsOtpVerified(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await accessService.resendOtp(email);
      if (response.success) {
        setTimer(60);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validate Twitter URL
  useEffect(() => {
    setIsTwitterUrlValid(twitterUrlPattern.test(twitterUrl));
  }, [twitterUrl]);

  // Handle Twitter URL submission
  const handleTwitterSubmit = async () => {
    if (!isTwitterUrlValid) {
      setError("Please enter a valid Twitter/X profile URL");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      // Here you would typically make an API call to verify the Twitter profile
      // For now, we'll simulate a successful connection
      setIsTwitterConnected(true);
    } catch (err) {
      setError("Failed to verify Twitter profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletChange = async (walletId: string) => {
    setSelectedWallet(walletId);
    try {
      setIsWalletLoading(true);
      setError("");
      // Map wallet ID to wallet name for connectWallet function
      const walletNameMap: { [key: string]: string } = {
        metamask: "Metamask",
        trust: "Trust Wallet",
        walletconnect: "Wallet Connect",
        coinbase: "Coinbase Wallet",
      };
      await connectWallet(walletNameMap[walletId]);
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsWalletLoading(false);
    }
  };

  // Get wallet logo based on selected wallet
  const getWalletLogo = () => {
    const walletLogos: { [key: string]: string } = {
      metamask: "/Login/Metamask.png",
      coinbase: "/Login/Coinbase.png",
      walletconnect: "/Login/Walletconnect.png",
      trust: "/Login/Trustwallet.png",
    };
    return walletLogos[selectedWallet] || "";
  };

  const handleSecureSpot = async () => {
    if (!isSecureSpotEnabled) {
      setError("Please complete all required steps");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      if (inviteCode.trim() !== "") {
        // Handle invite code flow
        const response = await accessService.completeWhitelist({
          email,
          accessCode: inviteCode,
        });

        if (response.success) {
          setIsWhitelisted(true);
          setShowSuccess(true);
          setIsInviteCodeFlow(true);
        } else {
          setError(response.message);
        }
      } else {
        // Handle regular flow
        const response = await accessService.completeProfile({
          email,
          walletAddress: address || "",
          twitterProfile: twitterUrl,
        });

        if (response.success) {
          setIsInviteCodeFlow(true);
          setShowChecklist(true);
        } else {
          setError(response.message);
        }
      }
    } catch (err) {
      setError("Failed to secure your spot. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInviteCodeFlowComplete =
    selectedWallet && email && inviteCode.trim() !== "";
  const isRegularFlowComplete =
    isOtpVerified && selectedWallet && isTwitterConnected;

  const isSecureSpotEnabled = isInviteCodeFlowComplete || isRegularFlowComplete;

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

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowChecklist(false);
      setShowSuccess(false);
      setShowEnterLab(false);
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status:
            step.id === 1 ? "completed" : step.id === 2 ? "active" : "inactive",
          buttonText:
            step.id === 2 ? "Follow" : step.id === 3 ? "Share" : undefined,
          buttonAction:
            step.id === 2
              ? () => handleStepAction(2)
              : step.id === 3
              ? () => handleStepAction(3)
              : undefined,
        }))
      );
      setEmail("");
      setOtp("");
      setTimer(0);
      setIsEmailValid(false);
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setIsTwitterConnected(false);
      setTwitterUrl("");
      setIsTwitterUrlValid(false);
      setError("");
      setIsLoading(false);
      setInviteCode("");
      setIsInviteCodeFlow(false);
      setIsInviteCodeVisible(false);
      setSelectedWallet("");
      setIsWhitelistedLocal(false);
      setIsWhitelisted(false);
    }
  }, [isOpen]);

  const isInviteCodeFormComplete =
    isEmailValid && selectedWallet && inviteCode.trim() !== "";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          onClose();
          setIsInviteCodeVisible(false);
          setShowChecklist(false);
          setShowSuccess(false);
          setShowEnterLab(false);
          setEmail("");
          setOtp("");
          setTimer(0);
          setIsOtpSent(false);
          setIsOtpVerified(false);
          setIsTwitterConnected(false);
          setTwitterUrl("");
          setIsTwitterUrlValid(false);
          setError("");
          setIsLoading(false);
          setInviteCode("");
          setIsInviteCodeFlow(false);
          setIsInviteCodeVisible(false);
          setSelectedWallet("");
          setIsWhitelistedLocal(false);
        }}
      >
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
                <div className="w-1/2 border-r rounded-e-3xl border-primary-100 relative">
                  <img
                    src="/Login/DexterWhitelist.png"
                    alt="Early Access"
                    className="absolute inset-0 w-full h-full object-cover rounded-e-3xl"
                  />
                </div>
                {/* Main Section */}
                <div className="w-1/2 bg-black/20 relative">
                  {/* Header */}
                  <div className="border-b border-primary-100 py-6 flex flex-col justify-center items-center relative">
                    <button
                      onClick={onClose}
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
                  {!isInviteCodeFlow ? (
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
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                          />
                        </div>
                      </div>

                      {/* Show only wallet connection for whitelisted users */}
                      {isWhitelistedLocal && (
                        <div className="space-y-2">
                          <label className="text-white text-sm font-medium">
                            Connect your wallet
                          </label>
                          {address ? (
                            <div className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getWalletLogo()}
                                  alt="Wallet"
                                  className="w-6 h-6"
                                />
                                <span className="text-white">
                                  {formatAddress(address, 4)}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedWallet("");
                                  handleWalletChange("");
                                }}
                                className="text-primary-100 hover:text-primary-100/80 transition-colors"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <WalletSelect
                              value={selectedWallet}
                              onChange={handleWalletChange}
                            />
                          )}
                        </div>
                      )}

                      {/* Show Enter Lab button for whitelisted users with connected wallet */}
                      {isWhitelistedLocal && (
                        <div className="relative w-full flex justify-center items-center py-4">
                          <button
                            onClick={() => {
                              setShowSuccess(true);
                              setIsWhitelisted(true);
                              setIsInviteCodeFlow(true);
                            }}
                            className="px-10 py-3 bg-primary-100 text-black font-bold rounded-lg hover:bg-primary-100/90 transition-colors"
                          >
                            Enter Lab
                          </button>
                        </div>
                      )}

                      {/* Show full form for non-whitelisted users */}
                      {!isWhitelistedLocal && (
                        <>
                          {/* Verification Code Field */}
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">
                              Email verification code
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digits verification code"
                                className={`w-full px-4 py-3 bg-transparent border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                                  isOtpVerified
                                    ? "border-green-500 focus:ring-green-500"
                                    : "border-primary-100/40 focus:ring-primary-100"
                                }`}
                              />
                              {!isOtpSent ? (
                                <button
                                  onClick={handleSendOtp}
                                  disabled={!isEmailValid || isLoading}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors ${
                                    (!isEmailValid || isLoading) &&
                                    "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {isLoading ? "Sending..." : "Send"}
                                </button>
                              ) : (
                                <button
                                  onClick={handleVerifyOtp}
                                  disabled={otp.length !== 6 || isLoading}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors ${
                                    (otp.length !== 6 || isLoading) &&
                                    "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {isLoading ? "Verifying..." : "Verify"}
                                </button>
                              )}
                            </div>
                            {isOtpSent && (
                              <div className="flex items-center justify-between mt-1">
                                <button
                                  onClick={handleResendOtp}
                                  disabled={timer > 0 || isLoading}
                                  className={`text-sm font-semibold text-primary-100 hover:text-primary-100/80 transition-colors ${
                                    (timer > 0 || isLoading) &&
                                    "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {timer > 0
                                    ? `Resend in ${timer}s`
                                    : "Resend code"}
                                </button>
                                {otp.length > 0 && otp.length !== 6 && (
                                  <span className="text-xs text-red-500">
                                    Please enter 6 digits
                                  </span>
                                )}
                              </div>
                            )}
                            {isOtpVerified && (
                              <div className="flex items-center gap-2 mt-1">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-xs text-green-500">
                                  Email verified successfully
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Wallet Selection */}
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">
                              Connect your wallet
                            </label>
                            {address ? (
                              <div className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={getWalletLogo()}
                                    alt="Wallet"
                                    className="w-6 h-6"
                                  />
                                  <span className="text-white">
                                    {formatAddress(address, 4)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedWallet("");
                                    handleWalletChange("");
                                  }}
                                  className="text-primary-100 hover:text-primary-100/80 transition-colors"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <WalletSelect
                                value={selectedWallet}
                                onChange={handleWalletChange}
                              />
                            )}
                          </div>

                          {/* X Account Connection */}
                          <div className="space-y-2">
                            <label className="text-white text-sm font-medium">
                              Connect X
                            </label>
                            {isTwitterConnected ? (
                              <div className="w-full px-4 py-3 bg-transparent border border-green-500 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-green-500"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                  <span className="text-white truncate">
                                    {twitterUrl}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsTwitterConnected(false);
                                    setTwitterUrl("");
                                  }}
                                  className="text-primary-100 hover:text-primary-100/80 transition-colors"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={twitterUrl}
                                    onChange={(e) =>
                                      setTwitterUrl(e.target.value)
                                    }
                                    placeholder="Enter your Twitter/X profile URL"
                                    className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                                  />
                                  <button
                                    onClick={handleTwitterSubmit}
                                    disabled={!isTwitterUrlValid || isLoading}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors ${
                                      (!isTwitterUrlValid || isLoading) &&
                                      "opacity-50 cursor-not-allowed"
                                    }`}
                                  >
                                    {isLoading ? "Verifying..." : "Connect"}
                                  </button>
                                </div>
                                {twitterUrl && !isTwitterUrlValid && (
                                  <p className="text-red-500 text-sm">
                                    Please enter a valid Twitter/X profile URL
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Secure Your Spot button for non-whitelisted users */}
                          <div className="relative w-full flex justify-center items-center py-4">
                            <button
                              onClick={handleSecureSpot}
                              disabled={!isSecureSpotEnabled || isLoading}
                              className={`px-10 py-3 bg-primary-100 text-black font-bold rounded-lg hover:bg-primary-100/90 transition-colors ${
                                !isSecureSpotEnabled &&
                                "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              {isLoading ? "Processing..." : "Secure Your Spot"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="py-7 px-12 relative">
                      <DexterAccessChecklist
                        steps={steps}
                        showSuccess={showSuccess}
                      />
                    </div>
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EarlyAccess;
