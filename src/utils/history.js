export const getItemIcon = (name) => {
  try {
    return require(`../assets/icons/${name.toLowerCase()}.svg?inline`)
  } catch (e) {
    return require('../assets/icons/blank_asset.svg?inline')
  }
}
