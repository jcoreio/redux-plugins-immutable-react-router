/* @flow */

import React from 'react'
import {Route, createRoutes} from 'react-router'
import size from 'lodash.size'
import mapValues from 'lodash.mapvalues'
import {LoadPluginComponent, PluginComponents} from 'redux-plugins-immutable-react'

import selectPluginRoutes from './selectPluginRoutes'

export default function createRouteDecorator(store: Object): (routes: any) => any {
  function wrapGetChildRoutes(func: Function, ...args: any[]): any {
    return (location, cb) => {
      const result = func(location, ...args, (err, routes) => {
        if (err) return cb(err)
        return cb(null, decorateRoutes(routes))
      })
      if (result) return decorateRoutes(result)
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
      if (result) return decorateIndexRoute(result)
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
      newProps.getChildRoutes = (location, cb) =>
        decorateRoutes(selectPluginRoutes(plugin => getChildRoutesFromPlugin(location, plugin))(store.getState()))
    }
    else if (childRoutesKey) {
      newProps.getChildRoutes = (location, cb) =>
        decorateRoutes(selectPluginRoutes(childRoutesKey)(store.getState()))
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
      newProps.getIndexRoute = (location, cb) =>
        decorateIndexRoute(selectPluginRoutes(plugin => getIndexRouteFromPlugin(location, plugin))(store.getState()))
    }
    if (indexRouteKey) {
      newProps.getIndexRoute = (location, cb) =>
        decorateIndexRoute(selectPluginRoutes(indexRouteKey)(store.getState()))
    }
    if (indexRoute) newProps.indexRoute = decorateIndexRoute(indexRoute)

    ////////////////////////////////////////////////////////////////////////////////
    // COMPONENT
    ////////////////////////////////////////////////////////////////////////////////

    const {getComponent, getComponentFromStore, getComponentFromPlugin, componentKey,
      pluginKey, componentProps} = route

    if (!getComponent && (getComponentFromStore || getComponentFromPlugin || componentKey)) {
      if (getComponentFromStore) {
        newProps.getComponent = (nextState, cb) => getComponentFromStore(nextState, store, cb)
      }
      else if (getComponentFromPlugin) {
        if (pluginKey) {
          newProps.component = props =>
            <LoadPluginComponent getComponent={getComponentFromPlugin} pluginKey={pluginKey}
                componentProps={componentProps ? {...componentProps, ...props} : props}
            />
        }
        else {
          newProps.component = props =>
            <PluginComponents getComponent={getComponentFromPlugin}
                componentProps={componentProps ? {...componentProps, ...props}: props}
            />
        }
      }
      else if (componentKey) {
        if (pluginKey) {
          newProps.component = props =>
            <LoadPluginComponent componentKey={componentKey} pluginKey={pluginKey}
                componentProps={componentProps ? {...componentProps, ...props} : props}
            />
        }
        else {
          newProps.component = props =>
            <PluginComponents componentKey={componentKey}
                componentProps={componentProps ? {...componentProps, ...props}: props}
            />
        }
      }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // COMPONENTS
    ////////////////////////////////////////////////////////////////////////////////

    const {getComponents, getComponentsFromStore, getComponentsFromPlugin, componentKeys} = route

    if (!getComponents && (getComponentsFromStore || getComponentsFromPlugin || componentKeys)) {
      if (getComponentsFromStore) {
        newProps.getComponents = (nextState, cb) => getComponentsFromStore(nextState, store, cb)
      }
      else if (componentKeys) {
        if (pluginKey) {
          newProps.components = mapValues(componentKeys, componentKey =>
            props => <LoadPluginComponent componentKey={componentKey} pluginKey={pluginKey}
                componentProps={componentProps ? {...componentProps, ...props}: props}
                     />)
        }
        else {
          newProps.components = mapValues(componentKeys, componentKey =>
            props => <PluginComponents componentKey={componentKey}
                componentProps={componentProps ? {...componentProps, ...props}: props}
                     />)
        }
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
