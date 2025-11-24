import Vapi from "@vapi-ai/web";

export const ASSISTANT_ID = "30698bd7-1483-49b4-8f61-26c79547a80e";
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
