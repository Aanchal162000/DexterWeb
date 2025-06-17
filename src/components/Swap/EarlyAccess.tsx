import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import AccessService from "../../services/accessService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const accessService = AccessService.getInstance();

interface EarlyAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const EarlyAccess: React.FC<EarlyAccessProps> = ({ isOpen, onClose }) => {
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isOtpValid, setIsOtpValid] = useState<boolean | null>(null);

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

  const handleSendOtp = async () => {
    try {
      await accessService.register({ email });
      setIsOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

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

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const res = await accessService.verifyOtp({ email, otp });
      setIsOtpValid(res.success);
      if (res.success) {
        toast.success("OTP verified successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error("Invalid OTP", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Add shake animation class
        const input = document.getElementById("otp-input");
        input?.classList.add("animate-shake");
        setTimeout(() => {
          input?.classList.remove("animate-shake");
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to verify OTP", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors"
                            >
                              Send
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

                      {/* X Account Connection */}
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium">
                          Connect X
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter your Twitter/X profile URL"
                            className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                          />
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-primary-100 hover:bg-primary-100/10 rounded transition-colors">
                            Connect
                          </button>
                        </div>
                      </div>

                      {/* Invite Code Section */}
                      <div className="space-y-2">
                        {!showInviteCode && (
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
                        {showInviteCode && (
                          <div className="relative space-y-2">
                            <label className="text-white text-sm font-medium">
                              Exclusive access code
                            </label>
                            <input
                              type="text"
                              placeholder="Enter your access code"
                              className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-100"
                            />
                          </div>
                        )}
                      </div>

                      {/* Secure Your Spot button */}
                      <div className="relative w-full flex justify-center items-center py-4">
                        <button className="px-10 py-3 bg-primary-100 text-black font-bold rounded-lg hover:bg-primary-100/90 transition-colors">
                          Secure Your Spot
                        </button>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default EarlyAccess;
