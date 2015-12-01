import {
  UPDATE_DATA, UPDATE_COUNTRIES, UPDATE_BORDERS
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
  borders : []
};

var dataReducer = generateReducer([], UPDATE_DATA);
var countriesReducer = generateReducer([], UPDATE_COUNTRIES);
var bordersReducer = generateReducer([], UPDATE_BORDERS);

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    countries : countriesReducer(state.countries, action),
    borders : bordersReducer(state.borders, action)
  };
}
