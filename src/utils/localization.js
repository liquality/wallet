import { I18n } from 'i18n-js'

export const i18n = new I18n()

export const loadLocale = async (locale, namespaces = ['common', 'components', 'pages']) => {
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
  }
}
