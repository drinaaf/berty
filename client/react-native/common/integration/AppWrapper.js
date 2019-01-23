import React, { Component } from 'react'
import { Platform } from 'react-native'
import App from '../components/App'
import { Tester, TestHookStore } from 'cavy'

import Onboarding from './tests/Onboarding.js'
import AppLoading from './tests/AppLoading.js'
import Contact from './tests/Contact.js'
import Chat from './tests/Chat.js'
import DevTools from './tests/DevTools.js'

const testHookStore = new TestHookStore()

const redirectConsoleLogsToTerminal = () => {
  if (Platform.OS !== 'web') {
    let DEBUG_LEVEL = 0
    let INFO_LEVEL = 1
    let WARN_LEVEL = 2
    let ERROR_LEVEL = 3

    console.log = log => global.nativeLoggingHook(log, DEBUG_LEVEL)
    console.info = log => global.nativeLoggingHook(log, INFO_LEVEL)
    console.warn = log => global.nativeLoggingHook(log, WARN_LEVEL)
    console.error = log => global.nativeLoggingHook(log, ERROR_LEVEL)
  }
}

export default class AppWrapper extends Component {
  render () {
    redirectConsoleLogsToTerminal()
    return (
      <Tester specs={[Onboarding, AppLoading, Contact, Chat, DevTools]} store={testHookStore} waitTime={4000} sendReport={Platform.OS === 'web'}>
        <App />
      </Tester>
    )
  }
}
