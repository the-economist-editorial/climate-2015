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
import TooltipRaw from './tooltip.js';
import ChartContainer from './chart-container.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateData, updateCountries, updateBorders, updateActiveData,
  showTooltip, hideTooltip
} from './actions.js';
import updateState from './reducers.js';

// const CREATESTORE = compose(window.devToolsExtension() || (f => f))(createStore);
const CREATESTORE = createStore;
var store = CREATESTORE(updateState);
window.store = store;

var scaleColours = [colours.blue[1], colours.red[3], colours.red[0]];
var scales = {
  co2 : chroma.scale(scaleColours).mode('lab').domain([0,1e4,1e7]),
  co2pc : chroma.scale(scaleColours).mode('lab').domain([0,3,22]),
  co2pcgdp : chroma.scale(scaleColours).mode('lab').domain([0,200,2000]),
  ghg : chroma.scale(scaleColours).mode('lab').domain([0,1e5,1.25e7]),
  ghgpc : chroma.scale(scaleColours).mode('lab').domain([0,5,25])
};
var dataFocus = '2012';

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
            return scales[state.activeData](data[state.activeData][dataFocus]);
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

var Tooltip = connectMap({
  show : 'tooltipShow'
})(TooltipRaw);

class Chart extends ChartContainer {
  render() {
    var measureToggleProps = {
      items : [
        { title : 'CO2', key : 'co2', value : 'co2' },
        { title : 'CO2 per capita', key : 'co2pc', value : 'co2pc' },
        { title : 'CO2 per capita GDP', key : 'co2pcgdp', value : 'co2pcgdp' },
        { title : 'Greenhouse gasses', key : 'ghg', 'value' : 'ghg' },
        { title : 'GHG per capita', key : 'ghgpc', 'value' : 'ghgpc'}
      ],
      action : (v) => { store.dispatch(updateActiveData(v)); }
    };

    var mapHeight = 400;
    var mapProps = {
      duration : null,
      height : mapHeight,
      layerHandlers : {
        countries : {
          mouseenter : function(d) {
            console.log(d3.event);
            var key = d.properties.iso_a3;
            var data = store.getState().data.find(v => v.ISO === key);
            store.dispatch(showTooltip(data));
          },
          mouseleave : function(d) {
            store.dispatch(hideTooltip());
          }
        }
      }
    };

    return(
      <div className='chart-container'>
        <Header title="A map" subtitle="Also to come"/>
        <MeasureToggleGroup {...measureToggleProps} />
        <svg height={mapHeight} width="595">
          <D3Map {...mapProps} />
        </svg>
        <Tooltip />
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
  const DATA_SERIES = ['co2', 'co2pc', 'co2pcgdp', 'ghg', 'ghgpc'];
  data = data.map(parseNumerics);

  data = data.map(d => {
    var values = DATA_SERIES.map(series => {
      var keyList = Object.keys(d).filter(k => k.split('_')[0] === series);
      var valueList = keyList.map(key => d[key]);
      var yearList = keyList.map(k => k.split('_')[1]);
      var obj = {};
      for (let i in yearList) {
        obj[yearList[i]] = valueList[i];
      }
      return obj;
    });
    var ret = { 'ISO' : d.ISO };

    for (let i in values) {
      ret[DATA_SERIES[i]] = values[i];
    }
    return ret;
  });
  store.dispatch(updateData(data));
});

fetchTopojson('./data/countries.json', updateCountries, 'ne_50m_admin_0_countries_lakes');
fetchTopojson('./data/borders.json', updateBorders, 'ne_50m_admin_0_boundary_lines_land');
