export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  PATIENTS: {
    LIST: '/patients',
    DETAIL: (id: string) => `/patients/${id}`,
  },

  EVALUATIONS: {
    // Fetch latest evaluation for a patient (sorted desc, limit 1)
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

  REPORTS: {
    PDF: (evaluationId: string) => `/reports/${evaluationId}/pdf`,
  },
} as const;
