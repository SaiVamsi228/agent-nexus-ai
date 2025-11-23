import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserVideoProps {
  isSpeaking: boolean;
}

export const UserVideo = ({ isSpeaking }: UserVideoProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(() => setHasPermission(true))
      .catch((err) => {
        console.error("Camera permission denied:", err);
        setHasPermission(false);
      });
  }, []);

  const toggleCamera = () => {
    setIsEnabled(!isEnabled);
  };

  if (!hasPermission) {
    return (
      <div className="relative w-full h-full bg-muted rounded-xl flex flex-col items-center justify-center p-8">
        <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-foreground mb-2">Camera Access Required</p>
        <p className="text-sm text-muted-foreground text-center">
          Please enable camera permissions to continue
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 rounded-xl shadow-glow-red z-10 pointer-events-none"
        />
      )}

      {/* Webcam feed */}
      {isEnabled ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <CameraOff className="w-16 h-16 text-muted-foreground" />
        </div>
      )}

      {/* Overlay controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleCamera}
          className="bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          {isEnabled ? (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Camera On
            </>
          ) : (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Camera Off
            </>
          )}
        </Button>
      </div>

      {/* Speaking indicator waveform */}
      {isSpeaking && (
        <div className="absolute top-4 left-4 flex gap-1 z-20">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent-red-light rounded-full shadow-lg"
              animate={{
                height: [12, 24, 12],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* User badge */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-medium z-20">
        <p className="text-xs font-semibold text-foreground">You</p>
      </div>
    </div>
  );
};
