export interface ExerciseCategoryFolder {
  id: string;
  name: string;
  category: string;
  folderName: string;
  images: string[];
}

export const EXERCISE_FOLDER_MAP: Record<string, ExerciseCategoryFolder> = {
  Knee_Exercises: {
    id: 'knee_folder',
    name: 'Knee Exercises',
    category: 'Knee',
    folderName: 'Knee_Exercises',
    images: [
      '/Exercise_Images/Knee_Exercises/Knee_Exercises.png',
    ],
  },
  Shoulder_Exercises: {
    id: 'shoulder_folder',
    name: 'Shoulder Exercises',
    category: 'Shoulder',
    folderName: 'Shoulder_Exercises',
    images: [
      '/Exercise_Images/Shoulder_Exercises/Shoulder_Exercises.png',
      '/Exercise_Images/Shoulder_Exercises/Shoulder_Exercises2.png',
    ],
  },
  Neck_Strengthening_Exercises: {
    id: 'neck_folder',
    name: 'Neck Strengthening Exercises',
    category: 'Neck',
    folderName: 'Neck_Strengthening_Exercises',
    images: [
      '/Exercise_Images/Neck_Strengthening_Exercises/Neck_Strengthening_Exercises.png',
      '/Exercise_Images/Neck_Strengthening_Exercises/Neck_Strengthening_Exercises2.png',
    ],
  },
  Facial_Retraining_Exercises: {
    id: 'facial_folder',
    name: 'Facial Retraining Exercises',
    category: 'Facial',
    folderName: 'Facial_Retraining_Exercises',
    images: [
      '/Exercise_Images/Facial_Retraining_Exercises/Facial_Retraining_Exercises.png',
      '/Exercise_Images/Facial_Retraining_Exercises/Facial_Retraining_Exercises2.png',
    ],
  },
  Spinal_Flexion_Exercises: {
    id: 'spinal_folder',
    name: 'Spinal Flexion Exercises',
    category: 'Back',
    folderName: 'Spinal_Flexion_Exercises',
    images: [
      '/Exercise_Images/Spinal_Flexion_Exercises/Spinal_Flexion_Exercises.png',
    ],
  },
  Dos_and_Donts: {
    id: 'dos_donts_folder',
    name: "Dos and Don'ts Guide",
    category: 'General',
    folderName: 'Dos_and_Donts',
    images: [
      '/Exercise_Images/Dos_and_Donts/Dos_and_Donts.png',
    ],
  },
};

/**
 * Get matching folder exercise images based on exact exercise name or category.
 * Guarantees deduplicated and valid image URLs.
 */
export function getExerciseImages(category?: string, exerciseName?: string): string[] {
  const normCategory = (category || '').trim().toLowerCase();
  const normName = (exerciseName || '').trim().toLowerCase();

  let matched: string[] = [];

  // Match by exact normalized exercise name first
  if (normName === 'knee exercises') {
    matched = EXERCISE_FOLDER_MAP.Knee_Exercises.images;
  } else if (normName === 'shoulder exercises') {
    matched = EXERCISE_FOLDER_MAP.Shoulder_Exercises.images;
  } else if (normName === 'neck strengthening exercises') {
    matched = EXERCISE_FOLDER_MAP.Neck_Strengthening_Exercises.images;
  } else if (normName === 'facial retraining exercises') {
    matched = EXERCISE_FOLDER_MAP.Facial_Retraining_Exercises.images;
  } else if (normName === 'spinal flexion exercises') {
    matched = EXERCISE_FOLDER_MAP.Spinal_Flexion_Exercises.images;
  } else if (normName === "dos and don'ts guide") {
    matched = EXERCISE_FOLDER_MAP.Dos_and_Donts.images;
  }
  // Fallback to category if exactly matching generic categories
  else if (normCategory === 'knee' && !normName) {
    matched = EXERCISE_FOLDER_MAP.Knee_Exercises.images;
  } else if (normCategory === 'shoulder' && !normName) {
    matched = EXERCISE_FOLDER_MAP.Shoulder_Exercises.images;
  } else if (normCategory === 'neck' && !normName) {
    matched = EXERCISE_FOLDER_MAP.Neck_Strengthening_Exercises.images;
  } else if (normCategory === 'facial' && !normName) {
    matched = EXERCISE_FOLDER_MAP.Facial_Retraining_Exercises.images;
  }

  // Deduplicate and return max 2 images
  return Array.from(new Set(matched)).slice(0, 2);
}
