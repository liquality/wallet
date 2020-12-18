export const exportToCSV = ({ filename, content }) => {
  var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename || 'download.csv')
  link.click()
  link.remove()
}

export const getCSVContent = (data) => {
  if (!data == null || !data.length) {
    return null
  }

  const columnDelimiter = ','
  const lineDelimiter = '\n'

  const keys = Object.keys(data[0])

  let result = `${keys.join(columnDelimiter)}${lineDelimiter}`

  data.forEach((item) => {
    let ctr = 0
    keys.forEach((key) => {
      if (ctr > 0) result += columnDelimiter

      result += item[key]
      ctr++
    })
    result += lineDelimiter
  })

  return result
}
