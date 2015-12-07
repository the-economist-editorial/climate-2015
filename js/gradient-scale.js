import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';
import d3 from 'd3';

import chroma from 'chroma-js';

class Tag extends React.Component {
  static get defaultProps() {
    return {
      point : 2,
      label : 'Hello'
    };
  }
  render() {
    return (<g transform={generateTranslateString(this.props.point, 22)}>
      <polygon points="0 0, 4 4, -4 4" fill="black"/>
      <text textAnchor="middle" y="15" fontSize="12">{this.props.label}</text>
    </g>);
  }
}

export default class GradientScale extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      scale : chroma.scale(['#FFF', '#f00', '#000']).domain([0,40,200])
    });
  }
  render() {
    var domain = this.props.scale.domain();
    var converter = d3.scale.linear().domain([0, 100]).range(domain);

    var stops = d3.range(0,101,5);

    var tag = this.props.tag || domain;

    var stopElements = stops.map(s => {
      return (<stop offset={s + '%'} stopColor={this.props.scale(converter(s))} />);
    });

    var tags = tag.map(t => {

    });

    return (<g transform={generateTranslateString(this.leftBound, this.topBound)}>
      <linearGradient id="gradient-scale-gradient">
        {stopElements}
      </linearGradient>
      <rect fill="url(#gradient-scale-gradient)" x="0" y="5" width="200" height="15"></rect>
      <Tag />
    </g>);
  }
}
