"use client";

import { useLoginContext } from "../../context/LoginContext";
import React from "react";

const Stepper = ({
  currentStep,
  numberOfSteps,
}: {
  currentStep: number;
  numberOfSteps: number;
}) => {
  const array = Array.from({ length: numberOfSteps });
  const { steps } = useLoginContext();
  const activeColor = (index: number) =>
    currentStep > index ? "bg-blue-500" : "bg-[#686B6E]";
  const isFinalStep = (index: number) => index === array.length - 1;

  return (
    <div className="flex flex-col ">
      <div className="flex items-center justify-center  ">
        {array.map((_, index) => (
          <React.Fragment key={index}>
            <div className={`w-5 h-5 rounded-full ${activeColor(index)}`}></div>
            {isFinalStep(index) ? null : (
              <div className={`w-44 h-1 ${activeColor(index)}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div
        className={`flex ${
          currentStep == 1 ? "items-center justify-center text-center" : ""
        }  space-x-36 mt-1`}
      >
        {steps.map((item, index) => (
          <div
            key={index}
            className="min-w-[3.125rem] max-w-[5rem] flex justify-center"
          >
            <p
              className={`text-white text-[10px] ${
                currentStep == index ? "block" : "hidden"
              } `}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Stepper;
