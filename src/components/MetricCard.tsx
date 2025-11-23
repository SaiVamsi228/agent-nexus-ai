import { motion } from "framer-motion";

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  delay?: number;
}

export const MetricCard = ({ icon, label, value, delay = 0 }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className="text-3xl font-bold text-foreground mb-1"
      >
        {value}
      </motion.div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </motion.div>
  );
};
