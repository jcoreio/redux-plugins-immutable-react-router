import React from 'react'
import {Route} from 'react-router'
import * as Immutable from 'immutable'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'

import createRouteDecorator from '../src/lib/createRouteDecorator'

describe('createRouteDecorator', () => {
  describe('childRoutes helpers', () => {
    it('processes getChildRoutes', () => {
      const TestRoute = <Route path="test" getChildRoutesFromStore={(location, store, cb) => []} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route getChildRoutes={(location, cb) => TestRoute} />
      )

      result = routes[0].getChildRoutes(null, null)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)

      routes = createRouteDecorator(store)(
        <Route getChildRoutes={(location, cb) => cb(null, TestRoute)} />
      )

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)
    })
    it('processes childRoutes', () => {
      const TestRoute = <Route path="test" getChildRoutesFromStore={(location, store, cb) => []} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      const result = decorateRoutes(
        <Route>{TestRoute}</Route>
      )
      expect(result[0].childRoutes[0].path).toBe('test')
      expect(result[0].childRoutes[0].getChildRoutes instanceof Function).toBe(true)
    })
    it('processes getChildRoutesFromStore', () => {
      const TestRoute = <Route path="test" getChildRoutesFromStore={(location, store, cb) => []} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route getChildRoutesFromStore={(location, store, cb) => store.getState().get('route')} />
      )

      result = routes[0].getChildRoutes(null, null)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)

      routes = createRouteDecorator(store)(
        <Route getChildRoutesFromStore={(location, store, cb) => cb(null, store.getState().get('route'))} />
      )

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)
    })
    it('processes getChildRoutesFromPlugin', () => {
      const TestRoute = <Route path="test" getChildRoutesFromPlugin={(location, plugin, cb) => []} />

      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        routes: Immutable.Map({
          test: TestRoute
        })
      })))

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route getChildRoutesFromPlugin={(location, plugin) => plugin.getIn(['routes', 'test'])} />
      )

      result = routes[0].getChildRoutes(null, null)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)
    })
    it('processes childRoutesKey', () => {
      const TestRoute = <Route path="test" childRoutesKey="nonexistent" />

      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        routes: Immutable.Map({
          test: TestRoute
        })
      })))

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route childRoutesKey="test" />
      )

      result = routes[0].getChildRoutes(null, null)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)
    })
  })
})
