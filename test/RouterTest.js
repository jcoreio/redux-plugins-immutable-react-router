import React from 'react'
import {Route, hashHistory} from 'react-router'
import Router from '../src/lib/Router'
import * as Immutable from 'immutable'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'

describe('Router', () => {
  it("successfully loads a route and that route's component from plugins", done => {
    const PLUGIN_KEY = 'plugin1'

    const TestRoute = <Route path="test" componentKey="test" pluginKey={PLUGIN_KEY} />
    const TestComponent = () => <h1>It works!</h1>

    const initialState = Immutable.fromJS({
      plugins: {}
    })
    const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
    store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
      key: PLUGIN_KEY,
      name: 'Plugin 1',
      routes: Immutable.Map({
        test: TestRoute
      }),
      load: (store, cb) => cb(null, Immutable.fromJS({
        components: Immutable.Map({
          test: TestComponent
        })
      }))
    })))

    const comp = mount(
      <Provider store={store}>
        <Router history={hashHistory}>
          <Route path="/" component="div">
            {TestRoute}
          </Route>
        </Router>
      </Provider>
    )

    setTimeout(() => {
      hashHistory.push('/test')
      setTimeout(() => {
        expect(comp.text()).toBe('It works!')
        done()
      }, 50)
    }, 50)
  })
})

