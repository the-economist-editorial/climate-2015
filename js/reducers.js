import {
  UPDATE_DATA, UPDATE_COUNTRIES, UPDATE_BORDERS, UPDATE_ACTIVE_DATA
} from './actions.js';

function generateReducer(defaultState, actionName) {
  return function(state = defaultState, action) {
    if(action.type !== actionName) { return state; }
    return action.data;
  }
}

var initialState = {
  data : [],
  countries : [],
  borders : [],
  activeData : 'co2'
};

var dataReducer = generateReducer(
  initialState.data, UPDATE_DATA);
var countriesReducer = generateReducer(
  initialState.countries, UPDATE_COUNTRIES);
var bordersReducer = generateReducer(
  initialState.borders, UPDATE_BORDERS);
var activeDataReducer = generateReducer(
  initialState.activeData, UPDATE_ACTIVE_DATA);

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    countries : countriesReducer(state.countries, action),
    borders : bordersReducer(state.borders, action),
    activeData : activeDataReducer(state.activeData, action)
  };
}
