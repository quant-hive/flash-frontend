import { authService } from "./auth-service";
import { backtestService, databaseService } from "./backtest-service";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserDetails,
} from "@/types/auth-service";
import {
  BacktestFormData,
  BacktestStatus,
  BacktestResults,
  Trade,
  ReturnData,
  DatabaseInfo,
  BenchmarkReturns,
} from "@/types/backtest-service";

/**
 * Centralized API service that provides abstracted methods for easier API access
 * This service acts as a facade over individual service modules
 */
export class ApiService {
  // Authentication methods
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return authService.login(credentials);
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    return authService.register(data);
  }

  static async getCurrentUser(): Promise<UserDetails> {
    return authService.getUserDetails();
  }

  static logout(): void {
    authService.logout();
  }

  static isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  static isAdmin(): boolean {
    return authService.isAdmin();
  }

  static getStoredUser(): any {
    // This will be handled by Redux selectors in components
    return null;
  }

  // Backtest methods
  static async runBacktest(data: BacktestFormData): Promise<BacktestStatus> {
    return backtestService.runBacktest(data);
  }

  static async getBacktestStatus(backtestId: string): Promise<BacktestStatus> {
    return backtestService.getBacktestStatus(backtestId);
  }

  static async getBacktestResults(
    backtestId: string
  ): Promise<BacktestResults> {
    return backtestService.getBacktestResults(backtestId);
  }

  static async getUserBacktests(): Promise<BacktestStatus[]> {
    return backtestService.getUserBacktests();
  }

  static async deleteBacktest(
    backtestId: string
  ): Promise<{ message: string }> {
    return backtestService.deleteBacktest(backtestId);
  }

  static getBacktestReportUrl(
    backtestId: string,
    format: "csv" | "html" = "csv"
  ): string {
    return backtestService.getBacktestReportUrl(backtestId, format);
  }

  static getBacktestDebugUrl(backtestId: string): string {
    return backtestService.getBacktestDebugUrl(backtestId);
  }

  static async getTradeReports(backtestId: string): Promise<Trade[]> {
    return backtestService.getTradeReports(backtestId);
  }

  static async getReturnsData(backtestId: string): Promise<ReturnData[]> {
    return backtestService.getReturnsData(backtestId);
  }

  // Database methods
  static async getAvailableInstruments(): Promise<string[]> {
    return databaseService.getAvailableInstruments();
  }

  static async getDatabaseInfo(): Promise<DatabaseInfo> {
    return databaseService.getDatabaseInfo();
  }

  static async getBenchmarkReturns(
    startDate: string,
    endDate: string
  ): Promise<BenchmarkReturns> {
    return databaseService.getBenchmarkReturns(startDate, endDate);
  }

  // Utility methods for common operations
  static async authenticateAndRedirect(
    credentials: LoginCredentials,
    router: any
  ): Promise<void> {
    try {
      const response = await this.login(credentials);
      if (response.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  }

  static async registerAndRedirect(
    data: RegisterData,
    router: any
  ): Promise<void> {
    try {
      const response = await this.register(data);
      if (response.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  }

  static async logoutAndRedirect(router: any): Promise<void> {
    this.logout();
    router.push("/login");
  }

  // Polling utility for backtest status
  static async pollBacktestStatus(
    backtestId: string,
    onUpdate: (status: BacktestStatus) => void,
    intervalMs: number = 2000
  ): Promise<BacktestStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getBacktestStatus(backtestId);
          onUpdate(status);

          if (status.status === "completed" || status.status === "failed") {
            resolve(status);
          } else {
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };
      poll();
    });
  }

  // Batch operations
  static async getCompleteBacktestData(backtestId: string): Promise<{
    status: BacktestStatus;
    results?: BacktestResults;
    trades?: Trade[];
    returns?: ReturnData[];
  }> {
    const status = await this.getBacktestStatus(backtestId);

    if (status.status === "completed") {
      const [results, trades, returns] = await Promise.all([
        this.getBacktestResults(backtestId),
        this.getTradeReports(backtestId),
        this.getReturnsData(backtestId),
      ]);

      return { status, results, trades, returns };
    }

    return { status };
  }
}
