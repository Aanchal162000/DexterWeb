import axios from "axios";

const baseURL = "https://dexters-backend.zkcross.exchange";

interface AuthRequest {
    walletAddress: string;
    message: string;
    signature: string;
}

interface TokenInfo {
    address: string;
    name: string;
    imageUrl?: string;
}

interface StartLoopRequest {
    privateKey: string;
    tokenInfo: TokenInfo;
    maxVolumeInVirtual: string;
    recommendedVolumeInVirtual: string;
    timelineDays: number;
}

interface UserLoopsQuery {
    page: string;
    limit: string;
}

interface UserLoopToken {
    name: string;
    address: string;
    imageUrl: string | null;
}

interface UserLoopProgress {
    amount: string;
    percentage: string;
    combined: string;
}

interface UserLoopTimeline {
    start: string;
    end: string;
    combined: string;
}

interface UserLoopActions {
    canCancel: boolean;
    canRestart: boolean;
}

interface UserLoopRawData {
    loopId: string;
    status: string;
    currentVolumeWei: string;
    maxVolumeWei: string;
    walletAddress: string;
    timelineDays: number;
    totalTrades: number;
    lastTradeAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface UserLoop {
    id: string;
    token: UserLoopToken;
    maxVolume: string;
    status: string;
    progress: UserLoopProgress;
    pointsEarned: number;
    swaps: number;
    timeline: UserLoopTimeline;
    balance: number;
    actions: UserLoopActions;
    raw: UserLoopRawData;
}

interface UserLoopsResponse {
    success: boolean;
    message: string;
    data: UserLoop[];
}

interface VolumeSummaryData {
    volume: {
        today: number;
        allTime: number;
        currency: string;
    };
    virgenPoints: {
        today: number;
        allTime: number;
    };
    lastUpdated: string;
}

interface VolumeSummaryResponse {
    success: boolean;
    message: string;
    data: VolumeSummaryData;
}

interface ChartDataset {
    label: string;
    data: number[];
    type: string;
    borderColor: string;
    backgroundColor: string;
    predictions: boolean[];
}

interface ChartDataResponse {
    labels: string[];
    datasets: ChartDataset[];
    metadata: {
        totalMonths: number;
        predictionMonths: number;
        historicalMonths: number;
    };
}

interface VolumeChartDataResponse {
    success: boolean;
    message: string;
    data: ChartDataResponse;
}

interface ChartDataQuery {
    includePrediction: boolean;
}

class ActionService {
    private static instance: ActionService;

    private constructor() { }

    public static getInstance(): ActionService {
        if (!ActionService.instance) {
            ActionService.instance = new ActionService();
        }
        return ActionService.instance;
    }

    async generateMessage(): Promise<any> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/auth/generate-message`,
            );
            return {
                success: true,
                message: "Message generated successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to generate message",
            };
        }
    }

    async createAuthToken(request: AuthRequest): Promise<any> {
        try {
            const { data } = await axios.post(
                `${baseURL}/api/auth/create-auth-token`,
                request
            );
            return {
                success: true,
                message: "Auth token created successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create auth token",
            };
        }
    }

    async testAuth(token: string): Promise<any> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/auth/test-auth`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            return {
                success: true,
                message: "Auth test successful",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Auth test failed",
            };
        }
    }

    async startLoop(request: StartLoopRequest, token: string): Promise<any> {
        try {
            const { data } = await axios.post(
                `${baseURL}/api/volume-loop/start`,
                request,
                { headers: { authorization: `Bearer ${token}` } }
            );
            return {
                success: true,
                message: "Loop started successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to start loop",
            };
        }
    }

    async getUserLoops(query: UserLoopsQuery, token: string): Promise<UserLoopsResponse> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/volume-loop/user-loops`,
                {
                    params: query,
                    headers: { authorization: `Bearer ${token}` }
                }
            );
            return {
                success: true,
                message: "User loops retrieved successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get user loops",
                data: [],
            };
        }
    }

    async getLoopStatus(loopId: string, token: string): Promise<any> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/volume-loop/status/${loopId}`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            return {
                success: true,
                message: "Loop status retrieved successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get loop status",
            };
        }
    }

    async stopLoop(loopId: string, token: string): Promise<any> {
        try {
            const { data } = await axios.post(
                `${baseURL}/api/volume-loop/stop/${loopId}`,
                {},
                { headers: { authorization: `Bearer ${token}` } }
            );
            return {
                success: true,
                message: "Loop stopped successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to stop loop",
            };
        }
    }

    async getVolumeSummary(token: string): Promise<VolumeSummaryResponse> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/volume-loop-analytics/summary`,
                { headers: { authorization: `Bearer ${token}` } }
            );
            return {
                success: true,
                message: "Volume summary retrieved successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get volume summary",
                data: {
                    volume: {
                        today: 0,
                        allTime: 0,
                        currency: "USD"
                    },
                    virgenPoints: {
                        today: 0,
                        allTime: 0
                    },
                    lastUpdated: new Date().toISOString()
                }
            };
        }
    }

    async getVolumeChartData(query: ChartDataQuery, token: string): Promise<VolumeChartDataResponse> {
        try {
            const { data } = await axios.get(
                `${baseURL}/api/volume-loop-analytics/chart-data`,
                {
                    params: query,
                    headers: { authorization: `Bearer ${token}` }
                }
            );
            return {
                success: true,
                message: "Volume chart data retrieved successfully",
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to get volume chart data",
                data: {
                    labels: [],
                    datasets: [],
                    metadata: {
                        totalMonths: 0,
                        predictionMonths: 0,
                        historicalMonths: 0
                    }
                }
            };
        }
    }
}

export const actionService = ActionService.getInstance();
