interface AgentRequest {
  genesisId: string;
  name: string;
  walletAddress: string;
  token: "eth" | "virtual";
  amount: string;
  launchTime: Date;
}

interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

class AgentService {
  private static instance: AgentService;
  private loading: boolean = false;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public async createAgent(data: AgentRequest): Promise<AgentResponse> {
    try {
      this.loading = true;

      const response = await fetch(
        "https://655a-2401-4900-8840-2429-434a-bfee-9674-4ebf.ngrok-free.app/api/agent/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating agent";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      this.loading = false;
    }
  }
}

export const agentService = AgentService.getInstance();
