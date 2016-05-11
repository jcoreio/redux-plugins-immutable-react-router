/* @flow */

import * as Immutable from 'immutable'
import React from 'react'
import memoize from 'lodash.memoize'
import {createSelector} from 'reselect'

function addKey(route: any, key: string): any {
  if (React.isValidElement(route)) return React.cloneElement(route, {key})
  return route
}

const selectPluginRoutes: (routeKeyOrFunc: string | (plugin: Immutable.Map) => any) => (state: any) => any[] = memoize(
  routeKeyOrFunc => createSelector(
    state => state.get('plugins'),
    plugins => {
      const result = []
      plugins.forEach(plugin => {
        const pluginKey = plugin.get('key')
        let routes
        if (routeKeyOrFunc instanceof Function) {
          routes = routeKeyOrFunc(plugin)
        }
        else {
          routes = plugin.getIn(['routes', routeKeyOrFunc])
        }
        if (routes && routes.entries instanceof Function) {
          for (let [index, route] of routes.entries()) result.push(addKey(route, `${pluginKey}-${index}`))
        }
        else if (routes) result.push(addKey(routes, pluginKey))
      })
      return result
    }
  )
)

export default selectPluginRoutes
