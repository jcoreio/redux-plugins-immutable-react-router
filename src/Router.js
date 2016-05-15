/* @flow */

import React, {Component, PropTypes} from 'react'
import {Router as ReactRouter} from 'react-router'
import {createSelector} from 'reselect'

import decorateRoutes from './decorateRoutes'

type Props = {
  store?: Object,
  children?: any,
  routes?: any[]
};

type State = {
  key: number 
};

export default class Router extends Component<void, Props, State> {
  static propTypes = {
    children: PropTypes.any,
    routes: PropTypes.array,
    store: PropTypes.object
  };
  static contextTypes = {
    store: PropTypes.object
  };
  
  state: State = {
    key: 0
  };

  router: ?Object;
  lastPlugins: any;
  unsubscribe: ?Function;

  componentDidMount(): void {
    const store = this.props.store || this.context.store
    if (store) this.unsubscribe = store.subscribe(this.onStateChange)
  }

  componentWillReceiveProps(nextProps: Props, nextContext: any): void {
    const store = this.props.store || this.context.store
    const nextStore = nextProps.store || nextContext.store
    if (store !== nextStore) {
      if (this.unsubscribe) this.unsubscribe()
      if (store) this.unsubscribe = store.subscribe(this.onStateChange)
      else this.unsubscribe = null
    }
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) this.unsubscribe()
  }

  onStateChange: Function = () => {
    const {router} = this;
    const store = this.props.store || this.context.store
    if (store && router) {
      const {lastPlugins} = this
      const nextPlugins = this.lastPlugins = store.getState().get('plugins')
      if (lastPlugins !== nextPlugins) {
        this.setState({key: this.state.key + 1})
      }
    }
  };

  // cache routes so that we don't pass a new copy of the same routes to ReactRouter.
  // if we passed the result of createRouteDecorator(store) every time, it would be a new object and react-router
  // would warn that the routes shouldn't be changed.  However, if the user does change the routes, this will make
  // it warn correctly.
  selectRoutes: (props: Props, context: Object) => any = createSelector(
    (props, context) => props.store || context.store,
    props => props.routes || props.children,
    (store, routes) => decorateRoutes(store)(routes)
  );

  render(): React.Element {
    return <ReactRouter {...this.props} key={this.state.key} ref={c => this.router = c}
                                        routes={this.selectRoutes(this.props, this.context)} children={null} />
  }
}
