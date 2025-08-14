import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type: 'track-card' | 'track-list' | 'widget' | 'search-results';
  count?: number;
}

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const shimmer = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear" as const,
    },
  };

  const skeletonBase = "bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 bg-[length:200%_100%] rounded animate-pulse";

  const renderTrackCard = () => (
    <motion.div
      className="glass rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Album Art Skeleton */}
      <motion.div
        className={`w-full aspect-square ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Title Skeleton */}
      <motion.div
        className={`h-5 w-3/4 ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Artist Skeleton */}
      <motion.div
        className={`h-4 w-1/2 ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Action Buttons Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <motion.div
          className={`h-8 w-8 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`h-10 w-10 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`h-8 w-8 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
      </div>
    </motion.div>
  );

  const renderTrackList = () => (
    <motion.div
      className="glass rounded-xl p-4 flex items-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Album Art Skeleton */}
      <motion.div
        className={`w-12 h-12 rounded-lg ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Track Info Skeleton */}
      <div className="flex-1 space-y-2">
        <motion.div
          className={`h-4 w-2/3 ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`h-3 w-1/2 ${skeletonBase}`}
          {...shimmer}
        />
      </div>
      
      {/* Duration Skeleton */}
      <motion.div
        className={`h-3 w-12 ${skeletonBase}`}
        {...shimmer}
      />
    </motion.div>
  );

  const renderWidget = () => (
    <motion.div
      className="glass rounded-3xl p-8 text-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Album Art Skeleton */}
      <motion.div
        className={`w-48 h-48 rounded-full mx-auto ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Track Info Skeleton */}
      <div className="space-y-3">
        <motion.div
          className={`h-6 w-3/4 mx-auto ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`h-4 w-1/2 mx-auto ${skeletonBase}`}
          {...shimmer}
        />
      </div>
      
      {/* Controls Skeleton */}
      <div className="flex justify-center items-center gap-6">
        <motion.div
          className={`w-12 h-12 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`w-16 h-16 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
        <motion.div
          className={`w-12 h-12 rounded-full ${skeletonBase}`}
          {...shimmer}
        />
      </div>
    </motion.div>
  );

  const renderSearchResults = () => (
    <div className="space-y-4">
      {/* Search Bar Skeleton */}
      <motion.div
        className={`h-14 w-full rounded-2xl ${skeletonBase}`}
        {...shimmer}
      />
      
      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-10 w-20 rounded-full ${skeletonBase}`}
            {...shimmer}
          />
        ))}
      </div>
      
      {/* Results Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="glass rounded-xl p-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <motion.div
              className={`w-12 h-12 rounded-lg ${skeletonBase}`}
              {...shimmer}
            />
            <div className="flex-1 space-y-2">
              <motion.div
                className={`h-4 w-2/3 ${skeletonBase}`}
                {...shimmer}
              />
              <motion.div
                className={`h-3 w-1/2 ${skeletonBase}`}
                {...shimmer}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'track-card':
        return renderTrackCard();
      case 'track-list':
        return renderTrackList();
      case 'widget':
        return renderWidget();
      case 'search-results':
        return renderSearchResults();
      default:
        return renderTrackCard();
    }
  };

  if (type === 'search-results') {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}