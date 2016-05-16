/* @flow */

import * as Immutable from 'immutable'
import React from 'react'
import memoize from 'lodash.memoize'
import {createSelector, createSelectorCreator, defaultMemoize} from 'reselect'

function shallowEqual(a, b) {
  if (a === b) return true
  if (a && b) {
    if (a.size !== b.size) return false
    return a.every((value, key) => value === b.get(key))
  }
  return false
}

const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual)

const selectPluginRoutes: (routeKeyOrFunc: string | (plugin: Immutable.Map) => any) => (state: any) => any[] = memoize(
  routeKeyOrFunc => {
    const getRoutes = routeKeyOrFunc instanceof Function
      ? routeKeyOrFunc
      : plugin => plugin.getIn(['routes', routeKeyOrFunc])
    const stage0 = createSelector(
      state => state.get('plugins'),
      plugins => plugins.map(getRoutes)
    )
    return createShallowEqualSelector(
      state => stage0(state),
      routeMap => {
        const result = []
        routeMap.forEach(routes => {
          if (routes) {
            if (Array.isArray(routes)) result.push(...routes)
            else result.push(routes)
          }
        })
        return result
      }
    )
  }
)

export default selectPluginRoutes
