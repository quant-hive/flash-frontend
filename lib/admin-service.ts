import axios from "./axios";
import { UserDetails } from "@/types/auth-service";

export const adminService = {
  async fetchAllUsers(): Promise<UserDetails[]> {
    const response = await axios.get<UserDetails[]>("/api/auth/users");
    return response.data;
  },
};