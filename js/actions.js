export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_BORDERS = 'UPDATE_BORDERS';
export const UPDATE_COUNTRIES = 'UPDATE_COUNTRIES';
export const UPDATE_ACTIVE_DATA = 'UPDATE_ACTIVE_DATA';
export const UPDATE_ACTIVE_YEAR = 'UPDATE_ACTIVE_YEAR';
export const CHANGE_TOOLTIP = 'CHANGE_TOOLTIP';

export function updateData(data) {
  return { type : UPDATE_DATA, data };
}

export function updateBorders(data) {
  return { type : UPDATE_BORDERS, data };
}
export function updateCountries(data) {
  return { type : UPDATE_COUNTRIES, data };
}
export function updateActiveData(data) {
  return { type : UPDATE_ACTIVE_DATA, data };
}
export function updateActiveYear(data) {
  return { type : UPDATE_ACTIVE_YEAR, data };
}

export function showTooltip(contents) {
  return {
    type : CHANGE_TOOLTIP,
    show : true,
    contents
  };
}
export function hideTooltip() {
  return {
    type : CHANGE_TOOLTIP,
    show : false
  };
}
