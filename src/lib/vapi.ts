import Vapi from "@vapi-ai/web";

export const ASSISTANT_ID = "073fcbe8-ce22-43ac-be1a-1f2c2ff77751";
export const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const createVapiInstance = () => {
  if (!VAPI_PUBLIC_KEY) {
    throw new Error("VITE_VAPI_PUBLIC_KEY environment variable is required");
  }
  return new Vapi(VAPI_PUBLIC_KEY);
};
