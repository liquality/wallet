import moment from 'moment/min/moment-with-locales'

const locale = window.navigator.userLanguage || window.navigator.language
moment.locale(locale)

export default moment
