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
import GradientScaleRaw from './gradient-scale.js';
import SliderRaw from './slider.js';

import countries from './countries.js';

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
var datasets = {
  co2 : {
    scale : chroma.scale(scaleColours).mode('lab').domain([0,1e5,1e7]),
    formatter : d3.format(',.0f'),
    tagFormatter : d3.format(',s'),
    tag : [1,1e5,1e7],
    mod: 'log',
    modDomain : [1, 1e7],
    unit : (<span>kilotonnes of CO<sub>2</sub> per year</span>),
    subtitle : 'From fossil fuel use and cement production, 2014'
  },
  co2pc : {
    scale : chroma.scale(scaleColours).mode('lab').domain([0,3,22]),
    formatter : d3.format(',.2f'),
    tag : [0,3,22],
    unit : (<span>tonnes of CO<sub>2</sub> per person per year</span>),
    subtitle : 'From fossil fuel use and cement production, 2014'
  },
  co2pcgdp : {
    scale : chroma.scale(scaleColours).mode('lab').domain([0,300,2000]),
    formatter : d3.format(',.2f'),
    tag : [0,300,2000],
    unit : (<span>per $1,000<super>†</super> GDP</span>),
    subtitle : 'From fossil fuel use and cement production, 2014'
  },
  ghg : {
    scale : chroma.scale(scaleColours).mode('lab').domain([0,1e5,1.25e7]),
    formatter : d3.format(',.0f'),
    tagFormatter : d3.format(',s'),
    tag : [1,1e5,1.25e7],
    mod : 'log',
    modDomain : [1, 1.25e7],
    maxYear : 2012,
    unit : (<span>megatonnes of CO<sub>2</sub> equivalent</span>),
    subtitle : 'Greenhouse gases*, 2012'
  },
  ghgpc : {
    scale : chroma.scale(scaleColours).mode('lab').domain([0,5,25]),
    formatter : d3.format(',.2f'),
    tag : [0,5,25],
    maxYear : 2012,
    unit : (<span>tonnes of CO<sub>2</sub> equivalent</span>),
    subtitle : 'Greenhouse gases*, 2012'
  }
};

var TiedHeader = connect(function(state) {
  return {
    subtitle : datasets[state.activeData].subtitle
  };
})(Header);

var D3Map = connect(function(state) {
  var hasData = !!state.data.length;
  var metadata = datasets[state.activeData];
  var year = metadata.maxYear ? Math.min(state.activeYear, metadata.maxYear) : state.activeYear;
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
            return metadata.scale(data[state.activeData][year]);
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

var Tooltip = connect(function(state) {
  var metadata = datasets[state.activeData];
  var year = metadata.maxYear ? Math.min(state.activeYear, metadata.maxYear) : state.activeYear;
  return {
    show : countries.hasOwnProperty(state.tooltipContents && state.tooltipContents.ISO) ? state.tooltipShow : false,
    mouseX : state.tooltipContents && state.tooltipContents.mouseX,
    mouseY : state.tooltipContents && state.tooltipContents.mouseY,
    template : function() {
      if(!state.tooltipContents) { return ''; }
      var iso = state.tooltipContents.ISO;
      var countryName = iso ? countries[iso].name : '';
      var datum = state.tooltipContents[state.activeData][year];
      return (<div>
        <h4>{countryName}</h4>
        <div>{metadata.formatter(datum)} {metadata.unit}</div>
      </div>);
    }
  };
})(TooltipRaw);

var GradientScale = connect(function(state) {
  var set = datasets[state.activeData];
  return {
    scale : set.scale,
    tag : set.tag || null,
    formatter : set.tagFormatter || set.formatter,
    mod : set.mod || null,
    modDomain : set.modDomain || null
  };
})(GradientScaleRaw);

class TextSection extends React.Component {
  static get defaultProps() {
    return {
      text : 'foo'
    };
  }
  render() {
    return (<span className='legend-label'>{this.props.text}</span>);
  }
}

var UnitText = connect(function(state) {
  return {
    text : datasets[state.activeData].unit
  };
})(TextSection);

class Chart extends ChartContainer {
  render() {
    var measureToggleProps = {
      items : [
        { title : (<span>CO<sub>2</sub></span>), key : 'co2', value : 'co2' },
        { title : (<span>CO<sub>2</sub> per person</span>), key : 'co2pc', value : 'co2pc' },
        { title : (<span>CO<sub>2</sub> per unit of GDP</span>), key : 'co2pcgdp', value : 'co2pcgdp' },
        { title : 'Greenhouse gases', key : 'ghg', 'value' : 'ghg' },
        { title : 'GHG per person', key : 'ghgpc', 'value' : 'ghgpc'}
      ],
      action : (v) => { store.dispatch(updateActiveData(v)); }
    };

    var mapHeight = 320;
    var mapProps = {
      duration : null,
      height : mapHeight,
      layerHandlers : {
        countries : {
          mouseenter : function(d) {
            var key = d.properties.iso_a3;
            var data = store.getState().data.find(v => v.ISO === key);

            data = Im.extend(data, {
              mouseX : d3.event.clientX,
              mouseY : d3.event.clientY
            });
            store.dispatch(showTooltip(data));
          },
          mouseleave : function(d) {
            store.dispatch(hideTooltip());
          }
        }
      }
    };

    var gradientScaleProps = {
      margin : [320, 100, 10]
    };

    return(
      <div className='chart-container'>
        <TiedHeader title="Global emissions" />
        <MeasureToggleGroup {...measureToggleProps} />
        <svg height={mapHeight + 50} width="595">
          <D3Map {...mapProps} />
          <GradientScale {...gradientScaleProps} />
        </svg>
        <UnitText />
        <div className="note"><super>†</super>$2012 at purchasing-power parity</div>
        <div className="note">*CO<sub>2</sub>, CH<sub>4</sub>, N<sub>2</sub>O, F-gases</div>
        <div className="source">Source: Emission Database for Global Atmospheric Research</div>
        <Tooltip />
      </div>
    );
  }
}

var chart = React.render(
  <Provider store={store}>
    {() => <Chart />}
  </Provider>, document.getElementById('interactive'));

function fetchTopojson(file, action, group) {
  d3.json(file, function(error, data) {
    store.dispatch(action(topojson.feature(data, data.objects[group]).features));
  });
}

d3.csv('./data/joined2.csv', function(err, data) {
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
