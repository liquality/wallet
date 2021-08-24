// Merely sets up the version
export const firstMigration = {
  version: 1,
  migrate: async (state) => {
    return { ...state }
  }
}
