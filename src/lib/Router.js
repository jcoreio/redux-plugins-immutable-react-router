/* @flow */

import React, {Component, PropTypes} from 'react'
import {Router as ReactRouter} from 'react-router'

import createRouteDecorator from './createRouteDecorator'

type Props = {
  store?: Object,
  children?: any,
  routes?: any[]
};

export default class Router extends Component<void, Props, void> {
  static propTypes = {
    children: PropTypes.any,
    routes: PropTypes.array,
    store: PropTypes.object
  };
  static contextTypes = {
    store: PropTypes.object
  };

  render(): React.Element {
    const store = this.props.store || this.context.store
    if (!store) throw new Error('missing store from props or context')

    const routes = createRouteDecorator(store)(this.props.routes || this.props.children)

    return <ReactRouter {...this.props} routes={routes} children={null} />
  }
}
