import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onFileChange: (file: File | null) => void;
}

export const ResumeUpload = ({ onFileChange }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!validateFile(selectedFile)) return;

      setIsUploading(true);
      setTimeout(() => {
        setFile(selectedFile);
        onFileChange(selectedFile);
        setIsUploading(false);
        toast({
          title: "Resume uploaded!",
          description: "Your resume will enhance the interview feedback",
        });
      }, 800);
    },
    [onFileChange, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    onFileChange(null);
    toast({
      title: "Resume removed",
    });
  }, [onFileChange, toast]);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-accent-red bg-accent-red-light/20 scale-[1.02]"
                : "border-border hover:border-accent-red/50 bg-card"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full border-4 border-accent-red/30 border-t-accent-red animate-spin" />
                <p className="text-sm font-medium text-foreground">Uploading...</p>
              </motion.div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3 text-accent-red" />
                <p className="text-base font-semibold text-foreground mb-1">
                  Drop your resume here
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Optional but makes feedback 10× better
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF only, max 10MB
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-accent-red-light/10 border border-accent-red/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent-red-light flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-red-dark" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-5 h-5 text-accent-red-dark flex-shrink-0" />
                  <p className="text-sm font-semibold text-foreground">Resume uploaded</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-accent-red-light hover:text-accent-red-dark"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
