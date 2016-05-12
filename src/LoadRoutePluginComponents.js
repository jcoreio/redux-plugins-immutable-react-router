/* @flow */

import * as Immutable from 'immutable'
import React, {Component, PropTypes} from 'react'

import {LoadPluginComponent, PluginComponents} from 'redux-plugins-immutable-react'

type Props = {
  route: {
    pluginKey?: string | Symbol,
    componentKey?: string | Symbol,
    getComponentFromPlugin?: (plugin: Immutable.Map) => any,
    componentProps?: Object
  }
};

export default class LoadRoutePluginComponents extends Component<void, Props, void> {
  static propTypes = {
    route: PropTypes.object
  };
  render(): ?React.Element {
    const {props} = this
    const {pluginKey, componentKey, getComponentFromPlugin: getComponent, componentProps} = props.route
    if (componentKey || getComponent) {
      if (pluginKey) {
        return (<LoadPluginComponent pluginKey={pluginKey} componentKey={componentKey} getComponent={getComponent}
            componentProps={componentProps ? {...componentProps, ...props} : props}
                />)
      }
      else {
        return (<PluginComponents componentKey={componentKey} getComponent={getComponent}
            componentProps={componentProps ? {...componentProps, ...props} : props}
                />)
      }
    }
    return null
  }
}
