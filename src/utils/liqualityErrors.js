import { i18n } from './localization'

export function translateLiqualityError(error) {
  const cause = i18n.translate(error.causeKey, error.data)
  const suggestions = i18n.translate(error.suggestionKey, error.data)
  return `${cause} ${suggestions}`
}
