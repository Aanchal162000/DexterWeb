import React from "react";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { AlertOption } from "@/utils/interface";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useLoginContext } from "@/context/LoginContext";
import Input from "@/components/HelpCenter/Input";
import AccessService from "@/services/accessService";
import { toastError, toastSuccess } from "@/utils/toast";

const accessService = AccessService.getInstance();

interface AlertsSettingsProps {
  onClose: () => void;
}

const AlertsSettings: React.FC<AlertsSettingsProps> = ({ onClose }) => {
  const [deliveryChannels, setDeliveryChannels] = React.useState({
    inTerminal: false,
    browser: false,
    email: false,
    mobile: false,
  });

  const [alertOptions, setAlertOptions] = React.useState({
    priceMovement: true,
    prototypeBonding: true,
    genesisAllocation: true,
    tokenLaunch: true,
  });

  const { permission, requestPermission } = useNotificationPermission();

  // Email modal state
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const [emailLoading, setEmailLoading] = React.useState(false);

  const { userProfile, address } = useLoginContext();

  React.useEffect(() => {
    if (showEmailModal && userProfile?.email) {
      setEmailInput(userProfile.email);
    }
  }, [showEmailModal, userProfile]);

  const handleDeliveryChannelChange = async (
    channel: keyof typeof deliveryChannels
  ) => {
    if (channel === "browser") {
      if (!deliveryChannels.browser) {
        // User is enabling browser notifications
        const result = await requestPermission();
        if (result !== "granted") {
          toastError("You must allow notifications to enable browser alerts.");
          return;
        }
      }
    }
    if (channel === "email") {
      if (!deliveryChannels.email) {
        setShowEmailModal(true);
        return;
      }
    }
    setDeliveryChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !address) {
      toastError("Email and wallet address are required.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await accessService.register({
        email: emailInput,
        walletAddress: address,
      });
      if (res.success) {
        setDeliveryChannels((prev) => ({ ...prev, email: true }));
        setShowEmailModal(false);
        toastSuccess("Subscribed to email alerts!");
      } else {
        toastError(res.message || "Failed to subscribe.");
      }
    } catch (err: any) {
      toastError(err?.message || "Failed to subscribe.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    setEmailInput(userProfile?.email || "");
  };

  const handleAlertOptionChange = (option: keyof typeof alertOptions) => {
    setAlertOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const deliveryChannelOptions: AlertOption[] = [
    {
      id: "inTerminal",
      title: "In-terminal",
      enabled: deliveryChannels.inTerminal,
      onChange: () => handleDeliveryChannelChange("inTerminal"),
    },
    {
      id: "browser",
      title: "Browser",
      enabled: deliveryChannels.browser,
      onChange: () => handleDeliveryChannelChange("browser"),
    },
    {
      id: "email",
      title: "Email",
      enabled: deliveryChannels.email,
      onChange: () => handleDeliveryChannelChange("email"),
    },
    {
      id: "mobile",
      title: "Mobile",
      enabled: deliveryChannels.mobile,
      onChange: () => handleDeliveryChannelChange("mobile"),
    },
  ];

  const alertControlOptions: AlertOption[] = [
    {
      id: "priceMovement",
      title: "Virtuals price movement",
      description:
        "Triggered when any Virtuals Protocol token in your wallet moves ±10% within 24 hours",
      enabled: alertOptions.priceMovement,
      onChange: () => handleAlertOptionChange("priceMovement"),
    },
    {
      id: "prototypeBonding",
      title: "Prototype bonding alert",
      description:
        "Triggered when a new agent enters the bonding phase in the Virtuals Protocol",
      enabled: alertOptions.prototypeBonding,
      onChange: () => handleAlertOptionChange("prototypeBonding"),
    },
    {
      id: "genesisAllocation",
      title: "Genesis allocation open",
      description:
        "Triggered when any Genesis round crosses 500% fundraising rate",
      enabled: alertOptions.genesisAllocation,
      onChange: () => handleAlertOptionChange("genesisAllocation"),
    },
    {
      id: "tokenLaunch",
      title: "Token launch alert",
      description:
        "Triggered when a token from a Genesis round becomes claimable or launches on a DEX",
      enabled: alertOptions.tokenLaunch,
      onChange: () => handleAlertOptionChange("tokenLaunch"),
    },
  ];

  return (
    <div className="w-full h-full  backdrop-blur-sm text-white overflow-y-auto">
      <div className="w-full flex flex-col ">
        {/* Header Section */}
        <div className="mb-8 border-b border-primary-100  py-5 px-8">
          <h1 className="text-xl leading-[1.6rem] font-bold text-white mb-[2px]">
            Dexter Alerts – Virtuals Smart Alerts
          </h1>
          <p className="text-gray-400 font-semibold text-sm">
            Stay ahead of critical movements in the Virtuals ecosystem, Dexter
            tracks it all so you can act faster, smarter, and with precision.
          </p>
        </div>
        <div className="flex-1 w-full py-[2px]">
          {deliveryChannelOptions.map((option, index) => (
            <div
              className={`py-4 px-8 flex flex-row  ${
                (index + 1) % 2 != 0 ? "bg-[#818284]/10" : "bg-none"
              }   `}
              key={option.id}
            >
              <div className="relative w-[45%]  items-center justify-start">
                {!index && (
                  <>
                    <h4 className="text-lg leading-[1.3rem] font-bold text-white mb-[1px]">
                      Alerts Delivery Channel
                    </h4>
                    <p className="text-gray-400 font-semibold text-base">
                      Choose how Dexter delivers the alerts
                    </p>
                  </>
                )}
              </div>

              <div className="relative w-[55%]  items-center justify-start">
                <div className="flex  gap-8 items-center justify-start py-1">
                  <Switch
                    checked={option.enabled}
                    onChange={option.onChange}
                    className={clsx(
                      "relative inline-flex h-7 w-12 items-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-gray-800 ",
                      option.enabled ? "bg-[#0047DA]" : "bg-gray-600"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-4 w-4 transform rounded-lg bg-white transition-transform ",
                        option.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </Switch>
                  <div className="text-gray-200 text-base font-semibold w-24">
                    {option.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {alertControlOptions.map((option, index) => (
            <div
              className={`py-4 px-8  flex flex-row ${
                (index + 1) % 2 != 0 ? "bg-[#818284]/10" : "bg-none"
              }  `}
              key={option.id}
            >
              <div className="relative w-[45%]  items-center justify-start">
                {!index && (
                  <>
                    <h4 className="text-lg leading-[1.3rem] font-bold text-white mb-[1px]">
                      Dexter Alerts Control
                    </h4>
                    <p className="text-gray-400 font-semibold text-base">
                      Let dexter track what matters, so you dont't have to
                    </p>
                  </>
                )}
              </div>

              <div className="relative w-[55%]  items-center justify-start">
                <div
                  className={`flex  gap-8 items-center justify-center py-1 `}
                >
                  <Switch
                    checked={option.enabled}
                    onChange={option.onChange}
                    className={clsx(
                      "relative inline-flex h-7 w-12 items-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-gray-800 flex-shrink-0",
                      option.enabled ? "bg-[#0047DA]" : "bg-gray-600"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-4 w-4 transform rounded-lg bg-white transition-transform flex-shrink-0",
                        option.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </Switch>
                  <div className="text-gray-200 text-base font-semibold flex-1 ">
                    <h4 className="text-base leading-[1.2rem] font-bold text-white mb-[1px]">
                      {option.title}
                    </h4>
                    <p className="text-gray-400 font-semibold text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Channels Section */}
        {/* <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Choose how Dexter delivers the alerts
          </h2>
          <div className="space-y-4">
            {deliveryChannelOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-gray-200">{option.title}</span>
                <Switch
                  checked={option.enabled}
                  onChange={option.onChange}
                  className={clsx(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-gray-800",
                    option.enabled ? "bg-primary-100" : "bg-gray-600"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      option.enabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </Switch>
              </div>
            ))}
          </div>
        </div> */}

        {/* Alerts Control Section */}
        {/* <div>
          <h2 className="text-lg font-semibold mb-4">
            Let Dexter track what matters, so you don't have to.
          </h2>
          <div className="space-y-6">
            {alertControlOptions.map((option) => (
              <div key={option.id} className="border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-200">{option.title}</span>
                  <Switch
                    checked={option.enabled}
                    onChange={option.onChange}
                    className={clsx(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-gray-800",
                      option.enabled ? "bg-primary-100" : "bg-gray-600"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        option.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </Switch>
                </div>
                {option.description && (
                  <p className="text-sm text-gray-400">{option.description}</p>
                )}
              </div>
            ))}
          </div>
        </div> */}
      </div>
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleEmailSubscribe}
            className="bg-[#181A20] rounded-xl p-8 w-full max-w-md shadow-lg flex flex-col gap-6 border border-primary-100"
          >
            <h3 className="text-lg font-bold text-white">
              Subscribe to Email Alerts
            </h3>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e: any) => setEmailInput(e.target.value)}
              isMandatory
            />
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                onClick={handleEmailModalClose}
                disabled={emailLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-primary-100 text-black font-semibold hover:bg-primary-200 disabled:opacity-60"
                disabled={emailLoading}
              >
                {emailLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AlertsSettings;
