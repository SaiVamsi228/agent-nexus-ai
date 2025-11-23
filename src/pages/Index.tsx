import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ResumeUpload } from "@/components/ResumeUpload";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState(2);
  const [resume, setResume] = useState<File | null>(null);
  const [isDark, setIsDark] = useState(false);

  const roles = ["Software Engineer", "Sales (SDR)", "Retail Associate"];

  const handleStartInterview = () => {
    if (!role) {
      toast({
        title: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    // Store settings in session storage
    sessionStorage.setItem("interviewSettings", JSON.stringify({ role, experience, hasResume: !!resume }));

    navigate("/interview");
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />

      {/* Dark mode toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full shadow-medium"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-accent-red-light/20 border border-accent-red-light rounded-full px-6 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent-red-dark" />
            <span className="text-sm font-semibold text-accent-red-dark">
              Powered by AI • 100% Free
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-6xl md:text-7xl font-bold text-foreground mb-6 tracking-tight"
          >
            AgentNexus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Real interviews. Real feedback.{" "}
            <span className="text-accent-red-dark font-semibold">Zero pressure.</span>
          </motion.p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Role Selection */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all">
            <h3 className="text-lg font-bold text-foreground mb-4">Select Role</h3>
            <div className="space-y-2">
              {roles.map((r) => (
                <motion.button
                  key={r}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                    role === r
                      ? "bg-accent-red-light text-accent-red-dark border-2 border-accent-red"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
                  }`}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Experience Slider */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all">
            <h3 className="text-lg font-bold text-foreground mb-4">Experience</h3>
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  key={experience}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold text-accent-red-dark mb-2"
                >
                  {experience}
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  {experience === 0 ? "Fresh Graduate" : `${experience} ${experience === 1 ? "Year" : "Years"}`}
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--accent-red)) ${
                      experience * 10
                    }%, hsl(var(--muted)) ${experience * 10}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>5</span>
                  <span>10+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all">
            <h3 className="text-lg font-bold text-foreground mb-4">Resume (Optional)</h3>
            <ResumeUpload onFileChange={setResume} />
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleStartInterview}
            disabled={!role}
            className="px-12 py-6 text-lg font-bold rounded-2xl shadow-medium hover:shadow-glow-red transition-all bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Interview
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Average session: 5-10 minutes
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16 text-sm text-muted-foreground"
        >
          <p>Built with AI • Practice makes perfect</p>
        </motion.div>
      </div>
    </div>
  );
}
