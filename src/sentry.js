import Vue from 'vue'
import * as Sentry from '@sentry/browser'
import { Vue as VueIntegration } from '@sentry/integrations'
import { Integrations } from '@sentry/tracing'

Sentry.init({
  dsn: 'https://2c52b9d6e67741cf9d4eabe32369827a@o241807.ingest.sentry.io/5444900',
  integrations: [
    new VueIntegration({
      Vue,
      tracing: true
    }),
    new Integrations.BrowserTracing()
  ],
  tracesSampleRate: 1
})
