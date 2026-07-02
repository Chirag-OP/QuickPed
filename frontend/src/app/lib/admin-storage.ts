import { createInitialInstitutes, syncInstituteMetrics, type InstituteData } from './admin-data';

const STORAGE_KEY = 'qp_admin_institutes_v2';
const SELECTED_KEY = 'qp_admin_selected_campus';

export const loadInstitutes = (): InstituteData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialInstitutes();
    const parsed = JSON.parse(raw) as InstituteData[];
    const institutes = Array.isArray(parsed) && parsed.length > 0 ? parsed : createInitialInstitutes();
    return institutes.map(syncInstituteMetrics);
  } catch {
    return createInitialInstitutes();
  }
};

export const saveInstitutes = (institutes: InstituteData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(institutes));
};

export const loadSelectedCampusId = (): string | null => {
  return localStorage.getItem(SELECTED_KEY);
};

export const saveSelectedCampusId = (id: string | null) => {
  if (id) localStorage.setItem(SELECTED_KEY, id);
  else localStorage.removeItem(SELECTED_KEY);
};
