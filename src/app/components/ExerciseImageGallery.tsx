import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { getExerciseImages } from '../../utils/exerciseImageMapper';

interface ExerciseImageGalleryProps {
  exerciseName?: string;
  category?: string;
  images?: string[];
  className?: string;
}

export const ExerciseImageGallery: React.FC<ExerciseImageGalleryProps> = ({
  exerciseName,
  category,
  images = [],
  className = '',
}) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const mappedImages = getExerciseImages(category, exerciseName);
  const allImages = Array.from(
    new Set(
      [...images, ...mappedImages].filter((url) => {
        if (typeof url !== 'string') return false;
        const trimmedUrl = url.trim();
        return (
          trimmedUrl.startsWith('data:image/') ||
          /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(\?.*)?(#.*)?$/i.test(trimmedUrl)
        );
      })
    )
  );

  if (allImages.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 ${className}`}>
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 opacity-50" />
          No exercise image available
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`grid gap-2 ${
          allImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {allImages.map((imgUrl, idx) => (
          <button
            type="button"
            key={`${imgUrl}-${idx}`}
            onClick={() => setExpandedImage(imgUrl)}
            className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 aspect-video text-left p-0"
          >
            <img
              src={imgUrl}
              alt={`${exerciseName || 'Exercise'} illustration ${idx + 1}`}
              className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </button>
        ))}
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-2 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded exercise"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
