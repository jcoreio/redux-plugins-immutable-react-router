import React from 'react'
import {Route, IndexRoute} from 'react-router'
import * as Immutable from 'immutable'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'

import createRouteDecorator from '../src/createRouteDecorator'

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

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
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

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
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

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
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

      routes[0].getChildRoutes(null, (err, routes) => result = routes)
      expect(result[0].path).toBe('test')
      expect(result[0].getChildRoutes instanceof Function).toBe(true)
    })
  })

  describe('indexRoute helpers', () => {
    it('processes getIndexRoute', () => {
      const TestRoute = <IndexRoute component="div" getIndexRouteFromStore={(location, store, cb) => []} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route path="/" getIndexRoute={(location, cb) => TestRoute} />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.component).toBe('div')
      expect(result.getIndexRoute instanceof Function).toBe(true)

      routes = decorateRoutes(
        <Route path="/" getIndexRoute={(location, cb) => cb(null, TestRoute)} />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.component).toBe('div')
      expect(result.getIndexRoute instanceof Function).toBe(true)
    })
    it('processes indexRoute', () => {
      const TestRoute = <IndexRoute getComponentFromStore={() => null} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes

      routes = decorateRoutes(
        <Route path="/">
          {TestRoute}
        </Route>
      )

      expect(routes[0].indexRoute.getComponent instanceof Function).toBe(true)
    })
    it('processes getIndexRouteFromStore', () => {
      const TestRoute = <IndexRoute component="div" getIndexRouteFromStore={(location, store, cb) => []} />

      const initialState = Immutable.Map({
        route: TestRoute
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route path="/" getIndexRouteFromStore={(location, store, cb) => store.getState().get('route')} />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.component).toBe('div')
      expect(result.getIndexRoute instanceof Function).toBe(true)

      routes = decorateRoutes(
        <Route path="/" getIndexRouteFromStore={(location, store, cb) => cb(null, store.getState().get('route'))} />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.component).toBe('div')
      expect(result.getIndexRoute instanceof Function).toBe(true)

    })
    it('processes getIndexRouteFromPlugin', () => {
      const TestRoute = <IndexRoute getComponentFromStore={() => null} />

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
        <Route path="/" getIndexRouteFromPlugin={(location, plugin) => plugin.getIn(['routes', 'test'])} />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.getComponent instanceof Function).toBe(true)
    })
    it('processes indexRouteKey', () => {
      const TestRoute = <IndexRoute getComponentFromStore={() => null} />

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
        <Route path="/" indexRouteKey="test" />
      )

      routes[0].getIndexRoute(null, (err, route) => result = route)
      expect(result.getComponent instanceof Function).toBe(true)
    })
  })
  describe('component helpers', () => {
    it('processes getComponentFromStore', () => {
      const TestComp = () => <h1>It works!</h1>

      const initialState = Immutable.Map({
        comp: TestComp
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const decorateRoutes = createRouteDecorator(store)

      let routes, result

      routes = decorateRoutes(
        <Route getComponentFromStore={(location, store, cb) => store.getState().get('comp')} />
      )

      result = routes[0].getComponent(null, null)
      expect(result).toBe(TestComp)

      routes = decorateRoutes(
        <Route getComponentFromStore={(location, store, cb) => cb(null, store.getState().get('comp'))} />
      )

      routes[0].getComponent(null, (err, comp) => result = comp)
      expect(result).toBe(TestComp)
    })
  })
})
