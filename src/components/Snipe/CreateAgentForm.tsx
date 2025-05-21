"use client";

import React, { useState } from "react";

interface CreateAgentFormProps {
  onClose: () => void;
}

type FormStep = "type" | "details" | "launch";

const CreateAgentForm: React.FC<CreateAgentFormProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>("type");
  const [formData, setFormData] = useState({
    chain: "base",
    launchType: "genesis",
    name: "",
    description: "",
    project: "",
    pitch: "",
    tokenomics: {
      publicSale: 37.5,
      liquidityPool: 12.5,
      developerAllocation: 50,
    },
    design: "",
    team: "",
    background: "",
    additionalDetails: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case "type":
        return (
          <div className="space-y-4">
            {/* <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary-100">Chain</h3>
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm ${
                    formData.chain === "base"
                      ? "border-primary-100 bg-primary-100/10"
                      : "border-gray-600"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, chain: "base" }))
                  }
                >
                  Base
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm ${
                    formData.chain === "solana"
                      ? "border-primary-100 bg-primary-100/10"
                      : "border-gray-600"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, chain: "solana" }))
                  }
                >
                  Solana
                </button>
              </div>
            </div> */}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-100">
                Launch Type
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div
                  className={`p-3 rounded-lg border cursor-pointer ${
                    formData.launchType === "genesis"
                      ? "border-primary-100 bg-black/50"
                      : "border-gray-600 bg-black/20"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, launchType: "genesis" }))
                  }
                >
                  <h4 className="font-medium text-primary-100 text-lg">
                    Genesis Launch
                  </h4>
                  <p className="text-sm text-gray-400 mt-1 leading-5">
                    Set a launch date. Virgens have 24 hours to pledge their
                    points for token allocation.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-400">Tokenomics:</p>
                    <ul className="text-sm text-gray-400 list-disc list-inside leading-5">
                      <li>37.5% (Public Sale)</li>
                      <li>12.5% (Liquidity Pool)</li>
                      <li>50.0% (Developer's Allocation)</li>
                    </ul>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border cursor-pointer ${
                    formData.launchType === "standard"
                      ? "border-primary-100 bg-black/50"
                      : "border-gray-600 bg-black/20"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, launchType: "standard" }))
                  }
                >
                  <h4 className="font-medium text-primary-100 text-lg">
                    Standard Launch
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Launch a brand new token directly.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-400">Tokenomics:</p>
                    <ul className="text-sm text-gray-400 list-disc list-inside">
                      <li>87.5% (Public Sale)</li>
                      <li>12.5% (Liquidity Pool)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-100">
                Agent Details
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Agent Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-black/60 outline-none rounded-lg px-3 py-4 text-base text-white placeholder-gray-400"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-black/60 outline-none rounded-lg px-3 py-4  text-base text-white placeholder-gray-400 h-20"
                />
                <textarea
                  name="project"
                  placeholder="Project Details"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full bg-black/60 outline-none rounded-lg px-3 py-4  text-base text-white placeholder-gray-400 h-20"
                />
                <textarea
                  name="pitch"
                  placeholder="Project Pitch"
                  value={formData.pitch}
                  onChange={handleInputChange}
                  className="w-full bg-black/60 outline-none rounded-lg px-3 py-4  text-base text-white placeholder-gray-400 h-20"
                />
              </div>
            </div>
          </div>
        );

      case "launch":
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-100">
                Launch Summary
              </h3>
              <div className="bg-black/60 rounded-lg p-3 space-y-2">
              <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Agent Name:</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Description:</span>
                  <span className="text-white">{formData.description}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Project Details:</span>
                  <span className="text-white">{formData.project}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Project Pitch:</span>
                  <span className="text-white">{formData.pitch}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Chain:</span>
                  <span className="text-white">{formData.chain}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Launch Type:</span>
                  <span className="text-white">{formData.launchType}</span>
                </div>
                <div className="flex flex-wrap justify-between text-base">
                  <span className="text-gray-400">Creation Fee:</span>
                  <span className="text-white">100 $VIRTUAL</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative h-[90%] flex flex-col ">
      <div className="mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-primary-100">
            Step{" "}
            {currentStep === "type" ? 1 : currentStep === "details" ? 2 : 3} of
            3
          </span>
          <span className="text-sm text-gray-400">
            {currentStep === "type"
              ? "Type"
              : currentStep === "details"
              ? "Details"
              : "Launch"}
          </span>
        </div>
        <div className="h-1 bg-gray-700 rounded-full">
          <div
            className="h-full bg-primary-100 rounded-full transition-all"
            style={{
              width:
                currentStep === "type"
                  ? "33%"
                  : currentStep === "details"
                  ? "66%"
                  : "100%",
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{renderStep()}</div>

      <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
        {currentStep !== "type" && (
          <button
            onClick={() =>
              setCurrentStep((prev) => (prev === "launch" ? "details" : "type"))
            }
            className="px-4 py-2 border border-primary-100/70 rounded-lg text-sm text-white hover:bg-gray-700"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (currentStep === "type") setCurrentStep("details");
            else if (currentStep === "details") setCurrentStep("launch");
            else {
              // Handle form submission
              console.log(formData);
              onClose();
            }
          }}
          className="px-4 py-2 bg-primary-100 rounded-lg text-sm text-black hover:bg-primary-100/90 ml-auto"
        >
          {currentStep === "launch" ? "Launch" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default CreateAgentForm;
