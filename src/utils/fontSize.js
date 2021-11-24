export function formatFontSize (numbers) {
  let fontSize = 50
  if (numbers.length > 6) {
    fontSize = 30
  } else if (numbers.length > 13) {
    fontSize = 15
  }

  return `${fontSize}px`
}
