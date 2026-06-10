import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  count?: number;
  variant?: 'grid' | 'list';
}

/**
 * SkeletonLoader - Shows animated placeholder while data is loading
 * Great for slow network responses
 */
export function SkeletonLoader({ count = 12, variant = 'grid' }: SkeletonLoaderProps) {
  const skeletons = Array(count).fill(0).map((_, i) => i);

  const shimmerAnimation = {
    initial: { backgroundPosition: '1000px 0' },
    animate: { backgroundPosition: '-1000px 0' },
  };

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="h-24 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
          >
            <motion.div
              variants={shimmerAnimation}
              initial="initial"
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
              style={{
                backgroundSize: '1000px 100%',
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletons.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="glass-card rounded-3xl overflow-hidden border border-slate-800"
        >
          {/* Image Skeleton */}
          <div className="h-56 bg-slate-800 border-b border-slate-800 overflow-hidden">
            <motion.div
              variants={shimmerAnimation}
              initial="initial"
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
              style={{
                backgroundSize: '1000px 100%',
              }}
            />
          </div>

          {/* Content Skeleton */}
          <div className="p-5 space-y-4">
            {/* Platform Badge */}
            <motion.div
              className="h-6 w-20 bg-slate-700 rounded-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Title Lines */}
            <div className="space-y-2">
              <motion.div
                className="h-4 bg-slate-700 rounded w-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="h-4 bg-slate-700 rounded w-4/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </div>

            {/* Price Skeleton */}
            <motion.div
              className="h-8 bg-slate-700 rounded w-32"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />

            {/* Button Skeleton */}
            <motion.div
              className="h-12 bg-slate-700 rounded-xl w-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * SearchingLoader - Animated "Searching..." indicator
 */
export function SearchingLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Animated Search Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500 shadow-lg shadow-cyan-500/30" />
      </motion.div>

      {/* Text with dots animation */}
      <div className="flex items-center gap-2">
        <p className="text-slate-300 text-lg font-semibold">Searching for deals</p>
        <motion.span
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 0, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400"
        >
          .
        </motion.span>
      </div>

      {/* Secondary message */}
      <p className="text-slate-500 text-sm mt-4">Comparing prices across stores...</p>

      {/* Animated bars (like equalizer) */}
      <div className="flex items-end gap-1 mt-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="w-1 h-8 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-full"
            style={{ transformOrigin: 'bottom' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default SkeletonLoader;
