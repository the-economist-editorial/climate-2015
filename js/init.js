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

import {
  updateData, updateCountries, updateBorders, updateActiveData
} from './actions.js';
import updateState from './reducers.js';

// const CREATESTORE = compose(window.devToolsExtension() || (f => f))(createStore);
const CREATESTORE = createStore;
var store = CREATESTORE(updateState);
window.store = store;

var scaleColours = [colours.blue[1], colours.red[3], colours.red[0]];
var scales = {
  co2_2012 : chroma.scale(scaleColours).mode('lab').domain([0,1e4,1e7]),
  co2pc_2012 : chroma.scale(scaleColours).mode('lab').domain([0,4,22]),
  co2pcgdp_2012 : chroma.scale(scaleColours).mode('lab').domain([0,100,2000])
};
var dataFocus = 'co2pcgdp_2012';

var D3Map = connect(function(state) {
  var hasData = !!state.data.length;
  return {
    layers : [
      { data : state.countries, name : 'countries' },
      { data : state.borders, name : 'borders' }
    ],
    layerAttrs : {
      countries : {
        fill : (d) => {
          var iso = d.properties.iso_a3;
          var data = state.data.filter(r => r.ISO === iso);
          data = data.length ? data[0] : null;
          if(hasData && data) {
            return scales[state.activeData](data[state.activeData]);
          }
          // no data
          return colours.grey[9];
        }
      }
    }
  };
})(D3MapRaw);

var MeasureToggleGroup = connectMap({
  value : 'activeData'
})(ToggleBarRaw);

class Chart extends ChartContainer {
  render() {
    var measureToggleProps = {
      items : [
        { title : 'CO2', key : 'co2_2012', value : 'co2_2012' },
        { title : 'CO2 Per Capita', key : 'co2pc_2012', value : 'co2pc_2012' },
        { title : 'CO2 Per Capita GDP', key : 'co2pcgdp_2012', value : 'co2pcgdp_2012' }
      ],
      action : (v) => { store.dispatch(updateActiveData(v)); }
    };

    var mapHeight = 400;
    var mapProps = {
      duration : null,
      height : mapHeight
    };

    return(
      <div className='chart-container'>
        <Header title="A map" subtitle="Also to come"/>
        <MeasureToggleGroup {...measureToggleProps} />
        <svg height={mapHeight} width="595">
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
  d3.json(file, function(error, data) {
    store.dispatch(action(topojson.feature(data, data.objects[group]).features));
  });
}

d3.csv('../data/joined.csv', function(err, data) {
  data = data.map(parseNumerics);
  store.dispatch(updateData(data));
});

fetchTopojson('./data/countries.json', updateCountries, 'ne_50m_admin_0_countries_lakes');
fetchTopojson('./data/borders.json', updateBorders, 'ne_50m_admin_0_boundary_lines_land');
