export const actions = {
  setLocalePrefference: ({ commit }, { locale }) => {
    console.log('SET_LOCALE', locale)
    commit('SET_LOCALE', { locale })
  },
  getBrowserLocale: () => {
    const browserLang = chrome.i18n.getUILanguage()
    // we only support the locale and not the region, so we should remove it
    if (browserLang.includes('-')) {
      return browserLang.split('-')[0]
    }
    return browserLang
  }
}
