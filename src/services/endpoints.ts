export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  USERS: {
    ME: '/users/me',
    UPDATE_ME: '/users/me',
    LIST: '/users',
    STAFF: '/users/staff',
    CREATE: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },

  CONFIG: {
    ALL: '/config',
    SCOPE: (scope: string) => `/config/${scope}`,
  },

  PATIENTS: {
    LIST: '/patients',
    LOOKUP_BY_PHONE: '/patients/lookup', // GET ?phone=xxx → { id, name, phone, ... }
    CREATE: '/patients',
    DETAIL: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    CHECKOUT: (id: string) => `/patients/${id}/checkout`,
    RECORDS: (id: string) => `/patients/${id}/records`,
    EXERCISE_PLANS: (patientId: string) => `/patients/${patientId}/exercise-plans`,
    HISTORY: (patientId: string) => `/patients/${patientId}/history`,
    UPLOAD_HISTORY: (patientId: string) => `/patients/${patientId}/history/upload`,
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
    SLOT_AVAILABILITY: '/appointments/slot-availability',
  },

  EXERCISE_PLANS: {
    DETAIL: (planId: string) => `/exercise-plans/${planId}`,
    UPDATE: (planId: string) => `/exercise-plans/${planId}`,
    DELETE: (planId: string) => `/exercise-plans/${planId}`,
  },

  EXERCISE_LIBRARY: {
    LIST: '/exercise-library',
    CREATE: '/exercise-library',
    DETAIL: (id: string) => `/exercise-library/${id}`,
    UPDATE: (id: string) => `/exercise-library/${id}`,
    DELETE: (id: string) => `/exercise-library/${id}`,
    PATIENT_ASSIGNMENTS: (patientId: string) => `/exercise-library/patients/${patientId}/assignments`,
    REMOVE_ASSIGNMENT: (patientId: string, templateId: string) =>
      `/exercise-library/patients/${patientId}/assignments/${templateId}`,
    CLEAR_ASSIGNMENTS: (patientId: string) =>
      `/exercise-library/patients/${patientId}/assignments`,
  },

  REPORTS: {
    PDF: (evaluationId: string) => `/reports/${evaluationId}/pdf`,
    DAILY: '/reports/daily',
    PATIENT_REPORT: (patientId: string) => `/reports/patient/${patientId}`,
    PATIENT_REPORT_PDF: (patientId: string) => `/reports/patient/${patientId}/pdf`,
  },

  REVENUE: {
    LIST: '/revenue',
  },

  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
  },

  TREATMENTS: {
    LIST: '/treatments',
  },
} as const;
