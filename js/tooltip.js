import React from 'react';
import InteractiveComponent from './interactive-component.js';

/**
 * A tooltip
 *
 * @prop {boolean} show - whether the tooltip should be shown
 * @prop {function} template - how to format the data point given to
 *       the tooltip into a display. Takes `this.props` as an argument
 */
export default class Tooltip extends InteractiveComponent {
  static get defaultProps() {
    return {
      template : () => {
        return (<span>Hark! a tooltip.</span>);
      },
      show : false
    }
  }
  render() {
    var tooltipProps = {
      className : ['tooltip', this.props.show ? null : 'tooltip-hidden']
        .filter((n => n != null)).join(' ')
    };

    return(<div {...tooltipProps}>{this.props.template(this.props)}</div>);
  }
}
