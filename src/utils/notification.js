export const createNotification = (config) =>
  browser.notifications.create({
    type: 'basic',
    iconUrl: './icons/512x512.png',
    ...config
  })

export const notify = ({ notificationId, options = {} }, callback) => {
  browser.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: './icons/512x512.png',
    ...options
  })
  if (callback) {
    browser.notifications.onClicked.addListener((id) => {
      callback(id)
      browser.notifications.clear(id)
    })
  }
}
