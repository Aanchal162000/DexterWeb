"use client";
import React, { useEffect, useState } from "react";
import TextArea from "./TextArea";
import Input from "./Input";
import Dropdown from "./Dropdown";
import axios from "axios";
import SuccessModal from "./SuccessModal";

export const Blockchains = [
  {
    blockchain: "Stellar",
  },
  {
    blockchain: "Partisia",
  },
  {
    blockchain: "Splinterlands",
  },
  {
    blockchain: "Arbitrum",
  },
  {
    blockchain: "Base",
  },
];

const dropdownOptions = [
  { name: "Support", id: "support" },
  { name: "Partnership", id: "partnership" },
  { name: "Bug Bounty", id: "bug-bounty" },
];

const InitialState = {
  address: "",
  email: "",
  message: "",
  transhash: "",
};

export default function Form({ dashboard = "zkCross Network Website" }) {
  const [selectedRequestType, setSelectedRequestType] = useState<any>("");
  const [selectedChain, setSelectedChain] = useState("Base");
  const [inputs, setInputs] = useState(InitialState);

  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState("Submit");

  const handleOnChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs({ ...inputs, [name]: value });
  };

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  }, [errorMessage]);

  const handleSendMail = async () => {
    if (
      inputs.email == "" ||
      selectedRequestType == "" ||
      selectedRequestType?.id === "support"
        ? selectedChain == "" || inputs.address == ""
        : false || inputs.message == "" || buttonText != "Submit"
    ) {
      setErrorMessage("Please fill all the mandatory fields.");
      return;
    }

    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!inputs.email.match(emailPattern)) {
      setErrorMessage("Please enter correct email and retry.");
      return;
    }

    setButtonText("Submitting...");
    const formData = {
      address: inputs.address,
      request_type: selectedRequestType?.name,
      message: inputs.message,
      email: inputs.email,
      blockchain: selectedChain,
      transhash: inputs.transhash,
      dashboard: dashboard,
    };

    axios
      .post(
        "https://mailer-backend-c3zke.ondigitalocean.app/form/submit",
        formData
      )
      .then((res) => {
        console.log(res);
        if (res?.status === 200 && res?.data?.success) {
          setIsSubmitted(true);
          setErrorMessage(null);
          setButtonText("Request Submitted");
        } else {
          throw new Error("Something went wrong");
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Something went wrong. Please try again later.");
      })
      .finally(() => {
        setButtonText("Submit");
      });
  };

  const handleModal = () => {
    setIsSubmitted(false);
    setInputs(InitialState);
    setSelectedChain("");
    setSelectedRequestType("");
  };

  return (
    <>
      <div className="relative bg-[linear-gradient(180deg,#171717bb_10%,#0a0a0a88_70%)] bg-[#C1C1C10D] border-[0.5px] border-primary-100 rounded-md my-2 ##bg-[url('/common/solutionBg.jpg')] bg-cover bg-no-repeat">
        <div className="bg-[url('/common/dots.png')] bg-repeat bg-[200%_200% bg-[length:300px_300px] w-full h-full absolute inset-0 opacity-10 z-0"></div>
        <div className="p-6 !!border-[#5a5a5a] rounded-md grid grid-cols-2 gap-6">
          <Input
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={inputs.email}
            type="email"
            isMandatory
            onChange={handleOnChange}
          />
          <Dropdown
            label="Request Type"
            name="request_type"
            placeholder="Select Request Type"
            value={selectedRequestType?.name}
            isMandatory
            onChange={(item: any) => setSelectedRequestType(item)}
            dropName={(item: any) => item?.name}
            options={dropdownOptions}
          />
          <Dropdown
            label="Blockchain"
            name="blockchain"
            placeholder="Select Blockchain"
            isDisabled
            value={selectedChain}
            isMandatory={selectedRequestType?.id == "support"}
            onChange={(item: any) => setSelectedChain(item?.blockchain)}
            dropName={(item: any) => item?.blockchain}
            options={Blockchains}
          />
          <Input
            name="address"
            label="Wallet Address"
            isMandatory={selectedRequestType?.id == "support"}
            placeholder="Enter your wallet address"
            value={inputs.address}
            onChange={handleOnChange}
          />
          {/* <Input
          name="username"
          label="Username"
          placeholder="Enter your username"
          value={inputs.username}
          onChange={handleOnChange}
        /> */}
          <Input
            name="transhash"
            label="Transaction Hash"
            placeholder="Enter your transaction hash"
            value={inputs.transhash}
            onChange={handleOnChange}
            singleLine
          />
          <TextArea
            label="Message"
            name="message"
            value={inputs.message}
            onChange={handleOnChange}
            isMandatory
            placeholder="Enter your support query"
          />
          <div className="flex flex-center flex-col col-span-2 my-3">
            {errorMessage && (
              <span className="text-red-500 text-base mb-4">
                {errorMessage}
              </span>
            )}
            <button
              className="mr-auto w-full self-center border-[none] disabled:opacity-50"
              onClick={handleSendMail}
            >
              <div
                className="rounded-md py-[6px] relative text-center sm:w-[10.5rem] w-[8rem] sm:h-[3.1rem] h-[2.6rem] flex sm:text-lg items-center justify-center group bg-primary-100 transition-all duration-300 hover:bg-[#2c73f7] before:contents-[''] before:absolute before:rounded-[5px] before:inset-[1px] before:bg-[linear-gradient(to_right,#000000AA,#222222AA)] after:content-[attr(data)] after:absolute after:text-white filter hover:drop-shadow-prime-btn"
                //@ts-ignore
                data={buttonText as any}
              ></div>
            </button>
          </div>
          <div className="col-span-2 p-2">
            <p className="text-[#9D9EA0] text-base text-left pt-3.5 border-t border-primary-100">
              To protect your privacy, please ensure that you are not providing
              any personal identifying information when submitting this request.
            </p>
          </div>
        </div>
      </div>
      <SuccessModal isOpen={isSubmitted} onClose={handleModal} />
    </>
  );
}
