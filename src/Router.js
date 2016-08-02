/* @flow */

import React, {Component, PropTypes} from 'react'
import {Router as ReactRouter} from 'react-router'
import {createSelector} from 'reselect'

import decorateRoutes from './decorateRoutes'

type Props = {
  children?: any,
  routes?: any[]
};

export default class Router extends Component<void, Props, void> {
  static propTypes = {
    children: PropTypes.any,
    routes: PropTypes.array
  };
  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  // cache routes so that we don't pass a new copy of the same routes to ReactRouter.
  // if we passed the result of createRouteDecorator(store) every time, it would be a new object and react-router
  // would warn that the routes shouldn't be changed.  However, if the user does change the routes, this will make
  // it warn correctly.
  selectRoutes: (props: Props, context: Object) => any = createSelector(
    (props, context) => context.store,
    props => props.routes || props.children,
    (store, routes) => decorateRoutes(store)(routes)
  );

  render(): React.Element<any> {
    return <ReactRouter {...this.props} routes={this.selectRoutes(this.props, this.context)} children={null} />
  }
}
