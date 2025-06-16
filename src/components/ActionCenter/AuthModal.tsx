import React, { useState } from "react";
import { actionService } from "../../services/contract/actionService";
import { AxiosError } from "axios";
import { toastError } from "@/utils/toast";
import { ethers } from "ethers";
import { WalletClient } from "viem";
import { useLoginContext } from "@/context/LoginContext";
import { useActionContext } from "@/context/ActionContext";

function AuthModal() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { address, currentProvider } = useLoginContext();
    const { setAuthToken } = useActionContext();

    const getAuthToken = async (message: string): Promise<void> => {
        let signature = "";
        try {
            const web3Provider = new ethers.providers.Web3Provider(currentProvider);
            const Signer = await web3Provider.getSigner();
            signature = await Signer.signMessage(message);

            const response = await actionService.createAuthToken({
                walletAddress: address!,
                message: message,
                signature: signature,
            });
            setAuthToken(response.data.data.authToken);
        } catch (error) {
            console.log("metaaaee", error);
            if ((error as AxiosError).code === "ERR_BAD_RESPONSE") toastError("Server is down. Please try again later.");
            if ((error as AxiosError).code === "ERR_NETWORK") toastError("Server CORS Error !");
            else toastError("Something went wrong");
            throw error;
        }
    };

    const handleGenerateMessage = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await actionService.generateMessage();

            if (response.success) {
                setMessage(response.data.message);
                await getAuthToken(response.data.data.message);
                console.log("Generated message:", response.data);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError("Failed to generate message");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center  bg-black/50 backdrop-blur-sm">
            <div className="w-[95%] max-w-md rounded-xl bg-black/50 p-6 backdrop-blur-sm flex flex-col items-center justify-between">
                <div className="flex flex-col gap-4 items-center justify-center mb-10">
                    <h3 className="text-lg font-semibold text-white">Dexter Access</h3>
                    <p className="text-sm text-gray-400">Please sign the message to access the platform.</p>

                    {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</div>}

                    {message && <div className="text-green-400 text-sm bg-green-900/20 p-2 rounded">Message generated successfully!</div>}
                </div>

                <button onClick={handleGenerateMessage} disabled={isLoading} className="bg-primary-100 text-black px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? "Generating..." : "Generate and Sign Message"}
                </button>
            </div>
        </div>
    );
}

export default AuthModal;
