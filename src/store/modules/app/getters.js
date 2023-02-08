export const getters = {
  isSettingsModalOpen(state) {
    const { settingsModalOpen } = state
    return settingsModalOpen
  },
  dappConnections(state) {
    const { wcPairings, wcSessions } = state

    const sessions = wcSessions.reduce((prev, curr) => {
      const {
        peer: {
          metadata: { url }
        }
      } = curr
      if (prev[url]) {
        prev[url] = [...prev[url], curr]
      } else {
        prev[url] = [curr]
      }
      return prev
    }, {})

    const pairings = wcPairings
      .filter((p) => p.active)
      .reduce((prev, curr) => {
        const {
          peerMetadata: { url }
        } = curr
        if (prev[url]) {
          prev[url] = [...prev[url], curr]
        } else {
          prev[url] = [curr]
        }
        return prev
      }, {})
    console.log('pairings', pairings)
    const sessionUrls = Object.keys(sessions)
    const pairingsUrls = Object.keys(pairings)
    const uniqueUrls = new Set([...sessionUrls, ...pairingsUrls])

    return [...uniqueUrls].reduce((prev, curr) => {
      prev[curr] = {
        sessions: sessions[curr] || [],
        pairings: pairings[curr] || []
      }
      return prev
    }, {})
  }
}
