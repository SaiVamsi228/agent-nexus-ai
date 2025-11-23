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

// FEEDBACK TYPE
interface FeedbackData {
  score: string;
  confidence: string;
  strengths: string[];
  improvements: string[];
  summary: string;
  recommendation: string;
}

// --- 🚀 HARDCODED DATA (ALWAYS VISIBLE) ---
const DEMO_FEEDBACK: FeedbackData = {
  score: "8.5/10",
  confidence: "High",
  summary: "The candidate demonstrated strong potential for an Entry-Level Software Engineer role. They showed excellent resilience when handling environmental distractions (the dog incident) and provided solid answers on Database concepts (NoSQL/Redis). However, there were initial gaps in foundational Data Structures theory which they navigated away from effectively.",
  recommendation: "Strong Hire",
  strengths: [
    "Excellent handling of interruptions (maintained professional composure during the dog distraction).",
    "Strong conceptual understanding of System Design (Redis & Caching strategies).",
    "Clear communication style when explaining architectural trade-offs.",
    "Demonstrated 'Agentic' behavior by pivoting topics when stuck."
  ],
  improvements: [
    "Initial hesitation when asked about basic Data Structure time complexities.",
    "Could improve emotional regulation under stress (became visibly frustrated at one point).",
    "Answers regarding OOP Polymorphism could be more structured."
  ]
};

const DEMO_TRANSCRIPT: Message[] = [
  { role: "assistant", content: "Hi, I'm Nexus. I have your profile here—it looks like we are doing an Entry-Level Software Engineer interview today. Are you ready to begin?", timestamp: Date.now() },
  { role: "user", content: "Yes, I'm ready.", timestamp: Date.now() },
  { role: "assistant", content: "Excellent. Let's start with Data Structures. Can you explain the time complexity of searching in a balanced Binary Search Tree vs. a Hash Map?", timestamp: Date.now() },
  { role: "user", content: "Honestly, I have no idea. I completely forgot. Can you explain it to me?", timestamp: Date.now() },
  { role: "assistant", content: "No problem, that's a specific detail. We can skip it. I'm here to evaluate, not to teach, so let's move on. Tell me, what is your preferred programming language?", timestamp: Date.now() },
  { role: "user", content: "I prefer Java because of its Object-Oriented features.", timestamp: Date.now() },
  { role: "assistant", content: "Java is a solid choice. Speaking of OOP, can you explain the concept of 'Polymorphism'?", timestamp: Date.now() },
  { role: "user", content: "Wait, sorry, there is a dog barking loudly outside my window and it's completely ruining my concentration.", timestamp: Date.now() },
  { role: "assistant", content: "Life happens, no worries. Whenever you're ready, I'm still listening for your answer on Polymorphism.", timestamp: Date.now() },
  { role: "user", content: "Okay, I'm back. Polymorphism allows a subclass to provide a specific implementation of a method.", timestamp: Date.now() },
  { role: "assistant", content: "Spot on. That's Method Overriding. Let's wrap up there.", timestamp: Date.now() }
];
// -----------------------------------------------------

export default function Report() {
  const navigate = useNavigate();

  // 🔥 FORCE: ALWAYS USE HARDCODED DATA
  // This ignores any data passed from the previous page to ensure consistency.
  const transcript = DEMO_TRANSCRIPT;
  const feedback = DEMO_FEEDBACK;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // CONFETTI EFFECT
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#fecaca", "#f87171", "#ef4444"],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#fecaca", "#f87171", "#ef4444"],
      });

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

    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div id="report-content" className="space-y-8">

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-red-600 dark:text-red-500" />
            </motion.div>

            <h1 className="text-5xl font-bold text-foreground">Interview Complete!</h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{feedback.summary}</p>

            <div className="inline-block bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-1 rounded-full text-sm font-bold mt-2 border border-red-200 dark:border-red-800">
              Verdict: {feedback.recommendation}
            </div>
          </motion.div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard icon="🏆" label="Score" value={feedback.score} delay={0.3} />
            <MetricCard icon="💬" label="Exchanges" value={transcript.length} delay={0.4} />
            <MetricCard icon="🧠" label="Confidence" value={feedback.confidence} delay={0.5} />
          </div>

          {/* STRENGTHS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100">Strengths</h2>
            </div>

            <ul className="space-y-2">
              {feedback.strengths.map((strength, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-start gap-2 text-green-800 dark:text-green-200"
                >
                  <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* IMPROVEMENTS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">Areas for Improvement</h2>
            </div>

            <ul className="space-y-2">
              {feedback.improvements.map((imp, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-start gap-2 text-amber-800 dark:text-amber-200"
                >
                  <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                  <span>{imp}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* TRANSCRIPT */}
          <motion.details initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="bg-card border border-border rounded-2xl overflow-hidden shadow-medium">
            <summary className="px-8 py-6 cursor-pointer hover:bg-muted/50 transition-colors font-semibold text-lg list-none flex justify-between items-center">
              <span>View Full Transcript ({transcript.length} messages)</span>
              <span className="text-sm text-muted-foreground">(Click to expand)</span>
            </summary>

            <div className="px-8 py-6 space-y-4 max-h-[500px] overflow-y-auto border-t border-border">
              {transcript.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.role === "user" ? "You" : "Nexus AI"}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.details>

          {/* ACTION BUTTONS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row gap-4 justify-center pb-12">
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