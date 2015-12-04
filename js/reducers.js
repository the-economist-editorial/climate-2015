import {
  UPDATE_DATA, UPDATE_COUNTRIES, UPDATE_BORDERS,
  UPDATE_ACTIVE_DATA, CHANGE_TOOLTIP
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
  activeData : 'co2',
  tooltipShow : false,
  tooltipContents : null
};

var dataReducer = generateReducer(
  initialState.data, UPDATE_DATA);
var countriesReducer = generateReducer(
  initialState.countries, UPDATE_COUNTRIES);
var bordersReducer = generateReducer(
  initialState.borders, UPDATE_BORDERS);
var activeDataReducer = generateReducer(
  initialState.activeData, UPDATE_ACTIVE_DATA);

function tooltipShowReducer(state = initialState.tooltipShow, action) {
  if(action.type !== CHANGE_TOOLTIP) { return state; }
  return action.show;
}
function tooltipContentsReducer(state = initialState.tooltipContents, action) {
  if(action.type !== CHANGE_TOOLTIP) { return state; }
  if(action.contents) { return action.contents; }
  return null;
}

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    countries : countriesReducer(state.countries, action),
    borders : bordersReducer(state.borders, action),
    activeData : activeDataReducer(state.activeData, action),
    tooltipShow : tooltipShowReducer(state.tooltipShow, action),
    tooltipContents : tooltipContentsReducer(state.tooltipContents, action)
  };
}
