import API from "./axiosInstance";

export const registerUser = async (inputs) => {
    try {
      const response = await API.post("/auth/register", inputs);
      return response.data;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };