export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_BORDERS = 'UPDATE_BORDERS';
export const UPDATE_COUNTRIES = 'UPDATE_COUNTRIES';

export function updateData(data) {
  return {
    type : UPDATE_DATA,
    data
  }
}

export function updateBorders(data) {
  return {
    type : UPDATE_BORDERS,
    data
  };
}
export function updateCountries(data) {
  return {
    type : UPDATE_COUNTRIES,
    data
  };
}
