export const createNotification = (config) =>
  browser.notifications.create({
    type: 'basic',
    iconUrl: './icons/512x512.png',
    ...config
  })
