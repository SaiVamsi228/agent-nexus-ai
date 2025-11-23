import { motion } from "framer-motion";

interface AvatarAgentProps {
  isSpeaking: boolean;
}

export const AvatarAgent = ({ isSpeaking }: AvatarAgentProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 rounded-full bg-accent-red/30 blur-3xl animate-pulse-glow"
        />
      )}
      
      {/* Main avatar */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent-red-light to-accent-red flex items-center justify-center shadow-medium"
      >
        {/* Inner circle */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="w-24 h-24 rounded-full bg-card flex items-center justify-center"
        >
          {/* Voice icon */}
          <svg
            className="w-12 h-12 text-accent-red-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              animate={{
                scale: isSpeaking ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: isSpeaking ? Infinity : 0,
              }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Waveform bars */}
      {isSpeaking && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent-red rounded-full"
              animate={{
                height: [8, 24, 8],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
