import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Home, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { Message } from "@/lib/vapi";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const transcript = (location.state?.transcript as Message[]) || [];
  const rawFeedback = location.state?.feedback as string; // String from backend
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [parsedFeedback, setParsedFeedback] = useState<any>(null);

  // Parse Markdown Feedback from Backend
  useEffect(() => {
    if (rawFeedback) {
        // Simple parsing logic assuming standard headers
        // Defaults if parsing fails
        let strengths = ["Good effort", "Completed session"];
        let improvements = ["Practice more"];
        let score = "7/10";
        let confidence = "Medium";

        try {
            // Extract Strengths
            const strengthsMatch = rawFeedback.split("## 2. Strengths")[1]?.split("##")[0];
            if (strengthsMatch) {
                strengths = strengthsMatch
                    .split("*")
                    .map(s => s.trim())
                    .filter(s => s.length > 5);
            }
            
            // Extract Improvements
            const improvementsMatch = rawFeedback.split("## 3. Areas for Improvement")[1]?.split("##")[0];
            if (improvementsMatch) {
                improvements = improvementsMatch
                    .split("*")
                    .map(s => s.trim())
                    .filter(s => s.length > 5);
            }

            // Heuristic Scoring based on keywords in Executive Summary (first section)
            if (rawFeedback.toLowerCase().includes("strong hire")) {
                score = "9/10";
                confidence = "High";
            } else if (rawFeedback.toLowerCase().includes("no hire")) {
                score = "4/10";
                confidence = "Low";
            }
        } catch (e) {
            console.error("Parsing error", e);
        }

        setParsedFeedback({ score, confidence, strengths, improvements });
    }
  }, [rawFeedback]);

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#fecaca", "#f87171", "#ef4444"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#fecaca", "#f87171", "#ef4444"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById("report-content");
      if (!reportElement) return;
      const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("AgentNexus-Interview-Report.pdf");
    } catch (error) { console.error("Error generating PDF:", error); } 
    finally { setIsGeneratingPDF(false); }
  };

  // Fallback if no data
  if (transcript.length === 0 && !rawFeedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No interview data found</p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const displayData = parsedFeedback || {
    score: "Pending",
    confidence: "Analyzing...",
    strengths: ["Analysis in progress..."],
    improvements: ["Analysis in progress..."]
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div id="report-content" className="space-y-8">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-red-light mb-4">
              <CheckCircle2 className="w-10 h-10 text-accent-red-dark" />
            </motion.div>
            <h1 className="text-5xl font-bold text-foreground">Interview Complete!</h1>
            <p className="text-xl text-muted-foreground">Here's your comprehensive performance analysis</p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard icon="🏆" label="Overall Score" value={displayData.score} delay={0.3} />
            <MetricCard icon="💬" label="Exchanges" value={transcript.length} delay={0.4} />
            <MetricCard icon="🧠" label="Confidence" value={displayData.confidence} delay={0.5} />
          </div>

          {/* Strengths */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {displayData.strengths.map((strength: string, idx: number) => (
                <motion.li key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + idx * 0.1 }} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                  <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Improvements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">Areas for Improvement</h2>
            </div>
            <ul className="space-y-2">
              {displayData.improvements.map((imp: string, idx: number) => (
                <motion.li key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + idx * 0.1 }} className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                  <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                  <span>{imp}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Full Transcript Block (Same as before) */}
           <motion.details
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-medium"
          >
            <summary className="px-8 py-6 cursor-pointer hover:bg-muted/50 transition-colors font-semibold text-lg">
              View Full Transcript ({transcript.length} messages)
            </summary>
            <div className="px-8 py-6 space-y-4 max-h-[500px] overflow-y-auto border-t border-border">
              {transcript.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.details>


          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={generatePDF} disabled={isGeneratingPDF} className="gap-2">
              <Download className="w-5 h-5" />
              {isGeneratingPDF ? "Generating PDF..." : "Download Report"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/")} className="gap-2">
              <Home className="w-5 h-5" />
              New Interview
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}