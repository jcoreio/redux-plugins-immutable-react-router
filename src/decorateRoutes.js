/* @flow */

import React from 'react'
import {Route, createRoutes} from 'react-router'
import {createSelector} from 'reselect'
import size from 'lodash.size'

import selectPluginRoutes from './selectPluginRoutes'
import LoadRoutePluginComponents from './LoadRoutePluginComponents'

const decorateRoutes: (store: Object) => (routes: Object | Object[]) => Object[] = store => createSelector(
  routes => routes,
  routes => {
    return createRoutes(routes).map(decorateRoute(store))
  }
)

const decorateIndexRoute: (store: Object) => (route: Object | Object[]) => Object = store => {
  const decorate = decorateRoute(store)
  return createSelector(
    route => route,
    route => {
      if (Array.isArray(route)) {
        if (route.length > 1) throw new Error("got more than one route for an index route: " + route)
        route = route[0]
      }
      if (React.isValidElement(route)) {
        route = createRoutes(<Route>{route}</Route>)[0].indexRoute
      }
      return decorate(route)
    }
  )
}

const decorateRoute: (store: Object) => (route: Object) => Object = store => createSelector(
  route => route,
  route => {
    function wrapGetChildRoutes(decorate: (routes: Object[]) => Object[], func: Function, ...args: any[]): any {
      return (location, cb) => {
        const result = func(location, ...args, (err, routes) => {
          if (err) {
            cb(err)
            return
          }
          cb(null, decorate(routes))
        })
        if (result) cb(null, decorate(result))
      }
    }

    function wrapGetIndexRoute(func: Function, ...args: any[]): any {
      const decorate = decorateIndexRoute(store)
      return (location, cb) => {
        const result = func(location, ...args, (err, route) => {
          if (err) {
            cb(err)
            return
          }
          cb(null, decorate(route))
        })
        if (result) cb(null, decorate(result))
      }
    }

    if (!route) return route

    const newProps = {}

    ////////////////////////////////////////////////////////////////////////////////
    // CHILD ROUTES
    ////////////////////////////////////////////////////////////////////////////////

    const {getChildRoutes, getChildRoutesFromStore, getChildRoutesFromPlugin, childRoutesKey, childRoutes} = route

    if (getChildRoutes) {
      newProps.getChildRoutes = wrapGetChildRoutes(decorateRoutes(store), getChildRoutes)
    }
    else if (getChildRoutesFromStore) {
      newProps.getChildRoutes = wrapGetChildRoutes(decorateRoutes(store), getChildRoutesFromStore, store)
    }
    else if (getChildRoutesFromPlugin) {
      const decorate = decorateRoutes(store)
      const select = selectPluginRoutes(plugin => getChildRoutesFromPlugin(location, plugin))
      newProps.getChildRoutes = (location, cb) => cb(null, decorate(select(store.getState())))
    }
    else if (childRoutesKey) {
      const decorate = decorateRoutes(store)
      const select = selectPluginRoutes(childRoutesKey)
      newProps.getChildRoutes = (location, cb) => cb(null, decorate(select(store.getState())))
    }
    if (childRoutes) newProps.childRoutes = decorateRoutes(store)(childRoutes)

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
      const decorate = decorateIndexRoute(store)
      const select = selectPluginRoutes(plugin => getIndexRouteFromPlugin(location, plugin))
      newProps.getIndexRoute = (location, cb) => cb(null, decorate(select(store.getState())))
    }
    if (indexRouteKey) {
      const decorate = decorateIndexRoute(store)
      const select = selectPluginRoutes(indexRouteKey)
      newProps.getIndexRoute = (location, cb) => cb(null, decorate(select(store.getState())))
    }
    if (indexRoute) newProps.indexRoute = decorateIndexRoute(store)(indexRoute)

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
)

export default decorateRoutes
