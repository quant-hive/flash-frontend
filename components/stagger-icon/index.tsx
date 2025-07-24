import { motion } from "motion/react";

export const StaggerIcon = ({
  icon: Icon,
  size = 16,
  className = "",
  duration = 0.25,
}: {
  icon: React.ElementType;
  size?: number;
  className?: string;
  duration?: number;
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ lineHeight: 0.75 }}
    >
      <motion.div
        variants={{
          initial: { y: 0 },
          hovered: { y: "-100%" },
        }}
        transition={{
          duration,
          ease: "easeInOut",
        }}
      >
        <Icon size={size} />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        variants={{
          initial: { y: "100%" },
          hovered: { y: 0 },
        }}
        transition={{
          duration,
          ease: "easeInOut",
        }}
      >
        <Icon size={size} />
      </motion.div>
    </div>
  );
};
