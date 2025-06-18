import React, { useEffect, useState, useRef } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { Transition } from "@headlessui/react";
import ReactConfetti from "react-confetti";

interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "active" | "inactive";
  buttonText?: string;
  buttonAction?: () => void;
}

interface DexterAccessChecklistProps {
  steps: Step[];
  showSuccess: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DexterAccessChecklist: React.FC<DexterAccessChecklistProps> = ({
  steps,
  showSuccess,
  containerRef,
}) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (showSuccess && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [showSuccess]);

  // Check if last step is active
  const isLastStepActive = steps[steps.length - 1]?.status === "active";

  return (
    <div className="w-full py-2 relative">
      {showSuccess && (
        <div className="absolute inset-0 w-[400px] h-[400px] overflow-hidden pointer-events-none">
          <ReactConfetti
            width={dimensions.width}
            height={800}
            numberOfPieces={1000}
            recycle={false}
            gravity={-0.05} // reverse gravity (upward)
            initialVelocityY={120} // positive Y velocity means upward due to negative gravity
            tweenDuration={5000}
            colors={[
              "#FFB3BA",
              "#BAFFC9",
              "#BAE1FF",
              "#FFFFBA",
              "#FFB3FF",
              "#B3FFBA",
              "#FFE4BA",
              "#E4BAFF",
            ]}
            confettiSource={{
              x: dimensions.width / 2,
              y: 800, // start from the bottom
              w: 2,
              h: 0,
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}

      <h2 className="text-lg font-bold text-white text-center mb-8">
        Complete Your Dexter Access Checklist
      </h2>

      <div className="relative">
        {/* Vertical line - positioned between first and last dot */}
        <div className="absolute left-10 top-[20px] h-[calc(100%-38px)] w-0.5 bg-gray-700" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative flex items-center justify-center"
            >
              <div
                className={`${
                  step.status === "inactive"
                    ? "text-gray-700"
                    : "text-primary-100"
                } text-base font-semibold mx-3`}
              >
                {index + 1}
              </div>
              {/* Step number with dot */}
              <div
                className={`relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-black  
                ${
                  step.status === "completed"
                    ? "bg-primary-100"
                    : step.status === "active"
                    ? "bg-primary-100 animate-pulse z-40"
                    : "bg-gray-600"
                }`}
              />

              {/* Step content */}
              <div className="ml-4 flex-1 justify-center items-center">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`text-base font-medium ${
                        step.status === "completed" || step.status === "active"
                          ? "text-[#00FFFF]"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {step.buttonText && (
                    <button
                      onClick={step.buttonAction}
                      disabled={
                        step.status === "inactive" ||
                        step.buttonText === "loading"
                      }
                      className={`w-[100px] py-1 ml-2 rounded-lg border ${
                        step.status === "active"
                          ? "border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 animate-pulse"
                          : "border-gray-600 text-gray-600 cursor-not-allowed"
                      } transition-colors duration-200`}
                    >
                      {step.buttonText === "loading" ? (
                        <div className="flex items-center justify-center">
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
                        </div>
                      ) : (
                        step.buttonText
                      )}
                    </button>
                  )}
                  {step.status === "completed" && (
                    <div className="px-10 py-1 ml-2 flex justify-center items-center">
                      <IoCheckmarkCircle className="text-primary-100 w-7 h-7" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Transition
        show={showSuccess}
        enter="transition-all duration-500"
        enterFrom="translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition-all duration-500"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-full opacity-0"
      >
        <div className="flex flex-col mt-16 bottom-0 left-0 right-0 p-6">
          <h3 className="text-primary-100 text-xl font-bold text-center mb-2">
            Congrats, You're in!
          </h3>
          <p className="text-gray-400 text-center whitespace-pre-line">
            {`You've completed all steps and secured 
            early access to Dexter.`}
          </p>
        </div>
      </Transition>
    </div>
  );
};

export default DexterAccessChecklist;
