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

// CHANGE THIS TO YOUR AZURE BACKEND URL
const BACKEND_URL = "https://your-backend-app.azurewebsites.net"; 

export default function InterviewRoom() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [callId, setCallId] = useState<string | null>(null); // Store Call ID
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [timer, setTimer] = useState(0);
  const [isEnding, setIsEnding] = useState(false); // Loading state for end button
  
  const processedMessages = useRef(new Set<string>());
  const timerRef = useRef<NodeJS.Timeout>();
  // Store feedback in ref to access it inside event listeners if needed
  const feedbackRef = useRef<string | null>(null);

  useEffect(() => {
    let vapiInstance: Vapi;
    try {
      vapiInstance = createVapiInstance();
      setVapi(vapiInstance);

      vapiInstance.on("call-start", (payload) => {
        setIsConnected(true);
        setTranscript([]);
        processedMessages.current.clear();
        
        // Capture the Call ID from Vapi (crucial for backend sync)
        // Vapi payload usually contains the call object
        const id = (payload as any)?.call?.id || (vapiInstance as any).call?.id;
        if (id) {
            console.log("Call ID captured:", id);
            setCallId(id);
        }
        
        toast({
          title: "Interview started",
          description: "Good luck! Speak naturally and confidently.",
        });
      });

      vapiInstance.on("call-end", () => {
        setIsConnected(false);
        setIsSpeaking(false);
        // Navigate to report with whatever data we have
        navigate("/report", { 
            state: { 
                transcript, 
                feedback: feedbackRef.current // Pass feedback if we have it
            } 
        });
      });

      vapiInstance.on("speech-start", () => setIsSpeaking(true));
      vapiInstance.on("speech-end", () => setIsSpeaking(false));

      vapiInstance.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcript) {
          const messageKey = `${message.role}-${message.transcript}`;
          
          if (!processedMessages.current.has(messageKey)) {
            processedMessages.current.add(messageKey);
            const newMessage: Message = {
              role: message.role === "user" ? "user" : "assistant",
              content: message.transcript,
              timestamp: Date.now(),
            };
            setTranscript(prev => [...prev, newMessage]);
            
            if (message.role === "user") {
              setIsUserSpeaking(true);
              setTimeout(() => setIsUserSpeaking(false), 1000);
            }
          }
        }
      });

      // Auto-start
      vapiInstance.start(ASSISTANT_ID)
        .then((call) => {
            if (call?.id) setCallId(call.id);
        })
        .catch(err => console.error(err));

    } catch (err) {
      console.error("Failed to initialize Vapi:", err);
    }

    return () => {
      if (vapiInstance) vapiInstance.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate, toast]);

  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // UPDATED END CALL LOGIC
  const endCall = async () => {
    setIsEnding(true);
    
    // 1. Try to generate report first
    if (callId) {
        try {
            toast({ title: "Generating Report...", description: "Analyzing your interview..." });
            
            const response = await fetch(`${BACKEND_URL}/generate-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ call_id: callId })
            });
            
            const data = await response.json();
            if (data.status === "success") {
                feedbackRef.current = data.feedback;
            }
        } catch (error) {
            console.error("Failed to generate report:", error);
        }
    }

    // 2. Stop Vapi (this triggers 'call-end' which navigates)
    if (vapi) {
      vapi.stop();
    }
    setIsEnding(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (vapi) vapi.setMuted(!isMuted);
  };

  const currentTranscript = transcript[transcript.length - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* ... (Header content same as before) ... */}
            <div className="text-2xl font-mono font-bold text-accent-red">
              {formatTime(timer)}
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
      
      {/* ... (Rest of UI same as before) ... */}
      
        {/* Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* AI Agent Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-medium flex flex-col"
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <AvatarAgent isSpeaking={isSpeaking} />
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">AI Interviewer</h3>
              <p className="text-sm text-muted-foreground">
                {isSpeaking ? "Speaking..." : "Listening"}
              </p>
            </div>

            {/* Live transcript */}
            <div className="w-full max-w-md bg-muted/50 rounded-xl p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
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

        {/* User Video Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-medium flex flex-col"
        >
          <div className="flex-1 p-4">
            <UserVideo isSpeaking={isUserSpeaking} />
          </div>

          {/* Controls */}
          <div className="border-t border-border bg-muted/30 px-6 py-4 flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="gap-2"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
              <span>{transcript.length} exchanges</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Arc (bottom) */}
      <div className="px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-red-light to-accent-red"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min((timer / 600) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Aim for 5-10 minutes for a comprehensive interview
          </p>
        </div>
      </div>
    </div>
  );
}