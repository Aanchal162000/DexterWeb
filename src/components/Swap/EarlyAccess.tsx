import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import WalletSelect from "./WalletSelect";
import DexterAccessChecklist from "./DexterAccessChecklist";
import AccessService from "@/services/accessService";

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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const accessService = AccessService.getInstance();

  // Reset verification state when email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Reset verification states
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp("");
    setTimer(0);
    setError("");
  };

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
      // Simulate successful OTP send
      setIsOtpSent(true);
      setTimer(60);
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
      // Simulate successful OTP verification
      setIsOtpVerified(true);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterConnect = () => {
    // Simulate successful Twitter connection
    setIsTwitterConnected(true);
  };

  const handleSecureSpot = async () => {
    if (!isOtpVerified || !selectedWallet || !isTwitterConnected) {
      setError("Please complete all required steps");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      // Simulate successful spot securing
      setShowChecklist(true);
    } catch (err) {
      setError("Failed to secure your spot. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormComplete = isOtpVerified && selectedWallet && isTwitterConnected;

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
    }
  }, [isOpen]);

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
          setEmail("");
          setOtp("");
          setTimer(0);
          setIsOtpSent(false);
          setIsOtpVerified(false);
          setIsTwitterConnected(false);
          setError("");
          setIsLoading(false);
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
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                          />
                        </div>
                      </div>

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
                            className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100 pr-24"
                          />
                          <button
                            onClick={handleSendOtp}
                            disabled={!isEmailValid || timer > 0 || isLoading}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors ${
                              (!isEmailValid || timer > 0 || isLoading) &&
                              "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            {isLoading
                              ? "Sending..."
                              : timer > 0
                              ? `Resend (${timer}s)`
                              : "Send"}
                          </button>
                        </div>
                        {isOtpSent && !isOtpVerified && (
                          <button
                            onClick={handleVerifyOtp}
                            disabled={!otp || isLoading}
                            className={`w-full mt-2 px-4 py-2 bg-primary-100 text-black font-medium rounded-lg hover:bg-primary-100/90 transition-colors ${
                              (!otp || isLoading) &&
                              "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                        )}
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                      )}

                      {/* Wallet Selection */}
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">
                          Connect your wallet
                        </label>
                        <WalletSelect
                          value={selectedWallet}
                          onChange={setSelectedWallet}
                        />
                      </div>

                      {/* X Account Connection */}
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">
                          Connect X
                        </label>
                        <button
                          onClick={handleTwitterConnect}
                          className={`w-full px-4 py-3 bg-gradient-to-r from-black to-zinc-800 border border-primary-100/40 rounded-lg text-gray-400 hover:bg-opacity-90 transition-colors flex items-center justify-between ${
                            isTwitterConnected ? "border-green-500" : ""
                          }`}
                        >
                          <span>
                            {isTwitterConnected
                              ? "Connected to X"
                              : "Link your X account"}
                          </span>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </button>
                      </div>

                      {/* Invite Code Section */}
                      <div className="space-y-4">
                        {!isInviteCodeVisible && (
                          <button
                            onClick={() =>
                              setIsInviteCodeVisible(!isInviteCodeVisible)
                            }
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            Got an exclusive Invite code?{" "}
                            <span className="text-white">Click here</span>
                          </button>
                        )}

                        {isInviteCodeVisible && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-white text-sm font-medium">
                                Exclusive access code
                              </label>
                              <input
                                type="text"
                                placeholder="Enter access code"
                                className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative w-full flex justify-center items-center py-4">
                        <button
                          onClick={handleSecureSpot}
                          disabled={!isFormComplete}
                          className={`px-10 py-3 bg-primary-100 text-black font-bold rounded-lg hover:bg-primary-100/90 transition-colors ${
                            !isFormComplete && "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {isLoading ? "Processing..." : "Secure your Spot"}
                        </button>
                      </div>
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
