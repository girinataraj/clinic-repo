export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  USERS: {
    ME: '/users/me',
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },

  PATIENTS: {
    LIST: '/patients',
    DETAIL: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    RECORDS: (id: string) => `/patients/${id}/records`,
    EXERCISE_PLANS: (patientId: string) => `/patients/${patientId}/exercise-plans`,
  },

  EVALUATIONS: {
    LIST: '/evaluations',
    LATEST_BY_PATIENT: (patientId: string) =>
      `/evaluations?patientId=${patientId}&sort=createdAt:desc&limit=1`,
    DETAIL: (id: string) => `/evaluations/${id}`,
    UPDATE: (id: string) => `/evaluations/${id}`,
    CREATE: '/evaluations',
  },

  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    DETAIL: (id: string) => `/appointments/${id}`,
    BY_PATIENT: (patientId: string) =>
      `/appointments?patientId=${patientId}&sort=datetime:asc`,
  },

  EXERCISE_PLANS: {
    DETAIL: (planId: string) => `/exercise-plans/${planId}`,
    UPDATE: (planId: string) => `/exercise-plans/${planId}`,
    DELETE: (planId: string) => `/exercise-plans/${planId}`,
  },

  REPORTS: {
    PDF: (evaluationId: string) => `/reports/${evaluationId}/pdf`,
  },
} as const;
