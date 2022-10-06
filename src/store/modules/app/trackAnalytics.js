export const trackAnalytics = async ({ state, dispatch }, { event, properties = {} }) => {
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
