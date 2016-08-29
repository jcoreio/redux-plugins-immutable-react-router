/* @flow */

import * as Immutable from 'immutable'
import React, {Component, PropTypes} from 'react'

import {LoadPluginComponent, PluginComponents} from 'redux-plugins-immutable-react'

type Props = {
  route: {
    pluginKey?: string | Symbol,
    componentKey?: string | Symbol,
    getComponentFromPlugin?: (plugin: Immutable.Map<any, any>) => any,
    componentProps?: Object
  }
};

export default class LoadRoutePluginComponents extends Component<void, Props, void> {
  static propTypes = {
    route: PropTypes.object
  };

  render(): ?React.Element<any> {
    const {componentKey, getComponentFromPlugin: getComponent} = this.props.route
    if (componentKey || getComponent) {
      const {pluginKey, componentProps} = this.props.route
      const props = componentProps ? {...componentProps, ...this.props} : this.props

      if (pluginKey) {
        return (
          <LoadPluginComponent
              pluginKey={pluginKey}
              componentKey={componentKey}
              getComponent={getComponent}
              componentProps={props}
          />
        )
      }
      else {
        return (
          <PluginComponents
              componentKey={componentKey}
              getComponent={getComponent}
              componentProps={props}
          />
        )
      }
    }
    return null
  }
}
