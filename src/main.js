import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// disable deprecated module warning
app.config.warnHandler = (msg, instance, trace) =>
  ![
    '<TransitionGroup> children must be keyed.',
    'Extraneous non-props attributes (toggleVerticalOverlayNavActive) were passed to component but could not be automatically inherited because component renders fragment or text root nodes',
    'Duplicate input name',
  ].some((warning) => msg.includes(warning)) &&
  console.warn('[Vue warn]: '.concat(msg).concat(trace))

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
