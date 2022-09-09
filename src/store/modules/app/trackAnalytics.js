export const trackAnalytics = async ({ state, dispatch }, { event, properties = {} }) => {
  console.log('on app Track analitycs', state.locale)
  dispatch(
    'trackAnalytics',
    {
      event,
      properties: {
        ...properties,
        locale: state.locale
      }
    },
    { root: true }
  )
}
