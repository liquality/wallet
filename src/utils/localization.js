import { liqualityErrorStringToJson } from '@liquality/error-parser'
import { I18n } from 'i18n-js'

export const i18n = new I18n()

const LIQUALITY_ERROR_NAMESPACE = 'liquality_errors'
export const loadLocale = async (
  locale,
  namespaces = ['common', 'components', 'pages', LIQUALITY_ERROR_NAMESPACE]
) => {
  if (!i18n.translations[locale]) {
    let resources = {}
    await Promise.all(
      namespaces.map(async (n) => {
        const translations = await import(`@/locales/${locale}/${n}.json`)
        resources[n] = translations.default
      })
    )
    i18n.store({ [locale]: { ...resources } })
  }
}

export const Localization = {
  install: (Vue) => {
    Vue.mixin({
      data() {
        return {
          currentLocale: i18n.locale
        }
      },
      computed: {
        locales() {
          return (process.env.VUE_APP_SUPPORTED_LOCALES || []).split(',')
        },
        localeInstance() {
          return i18n
        }
      },
      methods: {
        async changeLocale(locale) {
          await loadLocale(locale)
          i18n.locale = locale
          this.currentLocale = locale
        }
      }
    })

    Vue.prototype.$t = (key, options) => {
      return i18n.translate(key, options)
    }

    Vue.prototype.$tle = (error) => {
      // For translating liquality error string or liquality error objects
      const errorObj = typeof error === 'string' ? liqualityErrorStringToJson(error) : error
      return i18n.translate(
        `${LIQUALITY_ERROR_NAMESPACE}.${errorObj.translationKey}`,
        errorObj.data
      )
    }
  }
}
