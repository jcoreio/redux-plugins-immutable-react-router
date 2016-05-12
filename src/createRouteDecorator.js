/* @flow */

import React from 'react'
import {Route, createRoutes} from 'react-router'
import size from 'lodash.size'

import selectPluginRoutes from './selectPluginRoutes'
import LoadRoutePluginComponents from './LoadRoutePluginComponents'

export default function createRouteDecorator(store: Object): (routes: any) => any {
  function wrapGetChildRoutes(func: Function, ...args: any[]): any {
    return (location, cb) => {
      const result = func(location, ...args, (err, routes) => {
        if (err) return cb(err)
        return cb(null, decorateRoutes(routes))
      })
      if (result) cb(null, decorateRoutes(result))
    }
  }

  function decorateIndexRoute(route: any): any {
    if (Array.isArray(route)) {
      if (route.length > 1) throw new Error("got more than one route for an index route: " + route)
      route = route[0]
    }
    if (React.isValidElement(route)) {
      route = createRoutes(<Route>
        {route}
      </Route>)[0].indexRoute
    }
    return decorateRoute(route)
  }

  function wrapGetIndexRoute(func: Function, ...args: any[]): any {
    return (location, cb) => {
      const result = func(location, ...args, (err, route) => {
        if (err) return cb(err)
        return cb(null, decorateIndexRoute(route))
      })
      if (result) cb(null, decorateIndexRoute(result))
    }
  }

  function decorateRoute(route: any): any {
    if (!route) return route

    const newProps = {}

    ////////////////////////////////////////////////////////////////////////////////
    // CHILD ROUTES
    ////////////////////////////////////////////////////////////////////////////////

    const {getChildRoutes, getChildRoutesFromStore, getChildRoutesFromPlugin, childRoutesKey, childRoutes} = route

    if (getChildRoutes) {
      newProps.getChildRoutes = wrapGetChildRoutes(getChildRoutes)
    }
    else if (getChildRoutesFromStore) {
      newProps.getChildRoutes = wrapGetChildRoutes(getChildRoutesFromStore, store)
    }
    else if (getChildRoutesFromPlugin) {
      newProps.getChildRoutes = (location, cb) => cb(null,
        decorateRoutes(selectPluginRoutes(plugin => getChildRoutesFromPlugin(location, plugin))(store.getState())))
    }
    else if (childRoutesKey) {
      newProps.getChildRoutes = (location, cb) => cb(null,
        decorateRoutes(selectPluginRoutes(childRoutesKey)(store.getState())))
    }
    if (childRoutes) newProps.childRoutes = decorateRoutes(childRoutes)

    ////////////////////////////////////////////////////////////////////////////////
    // INDEX ROUTE
    ////////////////////////////////////////////////////////////////////////////////

    const {getIndexRoute, getIndexRouteFromStore, getIndexRouteFromPlugin, indexRouteKey, indexRoute} = route

    if (getIndexRoute) {
      newProps.getIndexRoute = wrapGetIndexRoute(getIndexRoute)
    }
    if (getIndexRouteFromStore) {
      newProps.getIndexRoute = wrapGetIndexRoute(getIndexRouteFromStore, store)
    }
    if (getIndexRouteFromPlugin) {
      newProps.getIndexRoute = (location, cb) => cb(null,
        decorateIndexRoute(selectPluginRoutes(plugin => getIndexRouteFromPlugin(location, plugin))(store.getState())))
    }
    if (indexRouteKey) {
      newProps.getIndexRoute = (location, cb) => cb(null,
        decorateIndexRoute(selectPluginRoutes(indexRouteKey)(store.getState())))
    }
    if (indexRoute) newProps.indexRoute = decorateIndexRoute(indexRoute)

    ////////////////////////////////////////////////////////////////////////////////
    // COMPONENT
    ////////////////////////////////////////////////////////////////////////////////

    const {getComponent, getComponentFromStore, getComponentFromPlugin, componentKey} = route

    if (!getComponent && (getComponentFromStore || getComponentFromPlugin || componentKey)) {
      if (getComponentFromStore) {
        newProps.getComponent = (nextState, cb) => getComponentFromStore(nextState, store, cb)
      }
      else if (getComponentFromPlugin || componentKey) {
        newProps.component = LoadRoutePluginComponents
      }
    }

    return size(newProps) ? {...route, ...newProps} : route
  }

  function decorateRoutes(routes: any): any {
    if (!routes) return routes
    return createRoutes(routes).map(decorateRoute)
  }

  return decorateRoutes
}
