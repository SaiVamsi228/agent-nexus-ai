import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarAgent } from "@/components/AvatarAgent";
import { UserVideo } from "@/components/UserVideo";
import { createVapiInstance, ASSISTANT_ID, Message } from "@/lib/vapi";
import { useToast } from "@/hooks/use-toast";
import type Vapi from "@vapi-ai/web";

// ⭐ UPDATE THIS TO YOUR REAL DEPLOYED BACKEND URL
const BACKEND_URL = "https://agent-nexus-be.onrender.com";

export default function InterviewRoom() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [timer, setTimer] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  const processedMessages = useRef(new Set<string>());
  const timerRef = useRef<NodeJS.Timeout>();
  const feedbackRef = useRef<string | null>(null);

  // -------------------------
  // INIT VAPI
  // -------------------------
  useEffect(() => {
    let vapiInstance: Vapi;

    try {
      vapiInstance = createVapiInstance();
      setVapi(vapiInstance);

      // CALL START
      vapiInstance.on("call-start", (payload: any) => {
        setIsConnected(true);
        setTranscript([]);
        processedMessages.current.clear();

        const id =
          payload?.call?.id ||
          (vapiInstance as any)?.call?.id ||
          null;

        if (id) {
          console.log("📞 Vapi Call ID:", id);
          setCallId(id);
        }

        toast({
          title: "Interview started",
          description: "Good luck! Speak confidently.",
        });
      });

      // CALL END
      vapiInstance.on("call-end", () => {
        setIsConnected(false);
        setIsSpeaking(false);

        navigate("/report", {
          state: {
            transcript,
            feedback: feedbackRef.current,
          },
        });
      });

      // AI SPEAKING EVENTS
      vapiInstance.on("speech-start", () => setIsSpeaking(true));
      vapiInstance.on("speech-end", () => setIsSpeaking(false));

      // TRANSCRIPT LISTENER
      vapiInstance.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcript) {
          const key = `${message.role}-${message.transcript}`;
          if (processedMessages.current.has(key)) return;

          processedMessages.current.add(key);

          const msg: Message = {
            role: message.role === "user" ? "user" : "assistant",
            content: message.transcript,
            timestamp: Date.now(),
          };

          setTranscript((prev) => [...prev, msg]);

          if (message.role === "user") {
            setIsUserSpeaking(true);
            setTimeout(() => setIsUserSpeaking(false), 800);
          }
        }
      });

      // ERRORS
      vapiInstance.on("error", (err) => {
        console.error("❌ Vapi Error:", err);
        toast({
          title: "Connection error",
          description: "Please check your internet connection",
          variant: "destructive",
        });
      });

      // AUTO-START CALL
      vapiInstance
        .start(ASSISTANT_ID)
        .then((call) => call?.id && setCallId(call.id))
        .catch((e) => console.error("Failed to start: ", e));
    } catch (error) {
      console.error("Vapi init failed:", error);
      toast({
        title: "Initialization error",
        description: "Refresh the page and try again.",
        variant: "destructive",
      });
    }

    return () => {
      if (vapiInstance) vapiInstance.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // -------------------------
  // TIMER LOGIC
  // -------------------------
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(
        () => setTimer((prev) => prev + 1),
        1000
      );
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [isConnected]);

  // -------------------------
  // END CALL + GENERATE REPORT
  // -------------------------
  const endCall = async () => {
    setIsEnding(true);

    if (callId) {
      try {
        toast({
          title: "Generating report...",
          description: "Analyzing your interview...",
        });

        const response = await fetch(`${BACKEND_URL}/generate-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ call_id: callId }),
        });

        const data = await response.json();
        if (data.status === "success") {
          feedbackRef.current = data.feedback;
        }
      } catch (err) {
        console.error("Error generating report:", err);
      }
    }

    // stop vapi → triggers call-end → navigate to /report
    vapi?.stop();
    setIsEnding(false);
  };

  // -------------------------
  // FORMAT TIMER
  // -------------------------
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const currentTranscript = transcript[transcript.length - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* HEADER */}
      <div className="bg-card border-b px-6 py-4 border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                Live Interview
              </span>
            </div>

            <div className="text-2xl font-mono font-bold text-accent-red">
              {formatTime(timer)}
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={endCall}
            disabled={isEnding}
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            {isEnding ? "Analyzing..." : "End Interview"}
          </Button>
        </div>
      </div>

      {/* SPLIT SCREEN */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">

        {/* AI SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border rounded-2xl p-8 shadow-medium flex flex-col border-border"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <AvatarAgent isSpeaking={isSpeaking} />

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">AI Interviewer</h3>
              <p className="text-sm text-muted-foreground">
                {isSpeaking ? "Speaking..." : "Listening"}
              </p>
            </div>

            <div className="w-full max-w-md bg-muted/50 p-4 rounded-xl min-h-[120px] max-h-[200px] overflow-y-auto">
              {currentTranscript ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-foreground leading-relaxed"
                >
                  <span className="font-semibold text-accent-red">
                    {currentTranscript.role === "user" ? "You: " : "AI: "}
                  </span>
                  {currentTranscript.content}
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Conversation will appear here...
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* USER SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border rounded-2xl shadow-medium flex flex-col border-border overflow-hidden"
        >
          <div className="flex-1 p-4">
            <UserVideo isSpeaking={isUserSpeaking} />
          </div>

          <div className="border-t px-6 py-4 bg-muted/30 border-border flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              onClick={() => {
                setIsMuted((m) => !m);
                vapi?.setMuted(!isMuted);
              }}
              size="lg"
              className="gap-2"
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              {isMuted ? "Unmute" : "Mute"}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
              <span>{transcript.length} exchanges</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* PROGRESS BAR */}
      <div className="px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-red-light to-accent-red"
              initial={{ width: "0%" }}
              animate={{
                width: `${Math.min((timer / 600) * 100, 100)}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Aim for 5–10 minutes for a complete interview
          </p>
        </div>
      </div>
    </div>
  );
}
