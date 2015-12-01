'use strict';

import d3 from 'd3';
import topojson from 'topojson';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import ToggleBarRaw from './toggle-bar.js';
import D3MapRaw from './d3map.js';
import ChartContainer from './chart-container.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import { updateData, updateCountries, updateBorders } from './actions.js';
import updateState from './reducers.js';

const CREATESTORE = compose(window.devToolsExtension() || (f => f))(createStore);
// const CREATESTORE = createStore;
var store = CREATESTORE(updateState);

var D3Map = connect(function(state) {
  return {
    layers : [
      state.countries,
      state.borders
    ]
  };
})(D3MapRaw);

class Chart extends ChartContainer {
  render() {
    var mapProps = {
      duration : null
    };

    return(
      <div className='chart-container'>
        <Header title="A map" subtitle="Also to come"/>
        <svg height="400" width="595">
          <D3Map {...mapProps} />
        </svg>
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>, document.getElementById('interactive'));

function fetchTopojson(file, action, group) {
  d3.json('./data/countries.json', function(error, data) {
    store.dispatch(action(topojson.feature(data, data.objects[group]).features));
  });
}

fetchTopojson('./data/countries.json', updateCountries, 'ne_10m_admin_0_countries_lakes');
// fetchTopojson('./data/borders.json', updateBorders, 'ne_10m_admin_0_countries_lakes');
