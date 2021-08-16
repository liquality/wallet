import { v4 as uuidv4 } from 'uuid'

export const analitycsSettings = { // Analytics
  version: 10,
  migrate: async (state) => {
    const userId = uuidv4()
    return {
      ...state,
      analytics: {
        userId,
        acceptedDate: null,
        askedDate: null,
        askedTimes: 0,
        notAskAgain: false
      }
    }
  }
}
