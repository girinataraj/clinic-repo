export interface ExerciseCategoryFolder {
  id: string;
  name: string;
  category: string;
  folderName: string;
  images: string[];
}

export const EXERCISE_FOLDER_MAP: Record<string, ExerciseCategoryFolder> = {
  Knee: {
    id: 'knee_folder',
    name: 'Knee Exercises',
    category: 'Knee',
    folderName: 'Knee_Exercises',
    images: [
      '/Exercise_Images/Knee_Exercises/Screenshot 2026-08-12 110412.png',
    ],
  },
  Shoulder: {
    id: 'shoulder_folder',
    name: 'Shoulder Exercises',
    category: 'Shoulder',
    folderName: 'Shoulder_Exercises',
    images: [
      '/Exercise_Images/Shoulder_Exercises/Screenshot 2026-08-12 110911.png',
      '/Exercise_Images/Shoulder_Exercises/Screenshot 2026-08-12 111143.png',
    ],
  },
  Neck: {
    id: 'neck_folder',
    name: 'Neck Strengthening Exercises',
    category: 'Neck',
    folderName: 'Neck_Strengthening_Exercises',
    images: [
      '/Exercise_Images/Neck_Strengthening_Exercises/Screenshot 2026-08-12 110632.png',
      '/Exercise_Images/Neck_Strengthening_Exercises/Screenshot 2026-08-12 111000.png',
    ],
  },
  Facial: {
    id: 'facial_folder',
    name: 'Facial Retraining Exercises',
    category: 'Facial',
    folderName: 'Facial_Retraining_Exercises',
    images: [
      '/Exercise_Images/Facial_Retraining_Exercises/Screenshot 2026-08-12 105847.png',
      '/Exercise_Images/Facial_Retraining_Exercises/Screenshot 2026-08-12 105908.png',
    ],
  },
  Back: {
    id: 'spinal_folder',
    name: 'Spinal Flexion Exercises',
    category: 'Back',
    folderName: 'Spinal_Flexion_Exercises',
    images: [
      '/Exercise_Images/Spinal_Flexion_Exercises/Screenshot 2026-08-12 111240.png',
    ],
  },
  'Dos and Don\'ts': {
    id: 'dos_donts_folder',
    name: "Dos and Don'ts Guide",
    category: 'General',
    folderName: 'Dos_and_Donts',
    images: [
      '/Exercise_Images/Dos_and_Donts/Screenshot 2026-08-12 111428.png',
    ],
  },
};

/**
 * Get matching folder exercise images based on category or exercise name.
 * Guarantees deduplicated and valid image URLs.
 */
export function getExerciseImages(category?: string, exerciseName?: string): string[] {
  const normCategory = (category || '').trim().toLowerCase();
  const normName = (exerciseName || '').trim().toLowerCase();

  let matched: string[] = [];

  if (normCategory.includes('knee') || normName.includes('knee')) {
    matched = EXERCISE_FOLDER_MAP.Knee.images;
  } else if (normCategory.includes('shoulder') || normName.includes('shoulder')) {
    matched = EXERCISE_FOLDER_MAP.Shoulder.images;
  } else if (normCategory.includes('neck') || normName.includes('neck')) {
    matched = EXERCISE_FOLDER_MAP.Neck.images;
  } else if (normCategory.includes('facial') || normName.includes('facial')) {
    matched = EXERCISE_FOLDER_MAP.Facial.images;
  } else if (normCategory.includes('spine') || normCategory.includes('back') || normName.includes('spinal') || normName.includes('back') || normName.includes('flexion')) {
    matched = EXERCISE_FOLDER_MAP.Back.images;
  } else if (normName.includes('dos') || normName.includes("don't") || normCategory.includes('dos')) {
    matched = EXERCISE_FOLDER_MAP["Dos and Don'ts"].images;
  }

  // Deduplicate results
  return Array.from(new Set(matched));
}
