import { createNotification } from '../../broker/notification'

export const showNotification = async (_, { title, message }) => {
  createNotification({ title, message })
}
