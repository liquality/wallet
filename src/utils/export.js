export const exportToCSV = ({ filename, content }) => {
  var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename || 'download.csv')
  link.click()
  link.remove()
}

export const getCSVContent = (data, headers) => {
  if (!data == null || !data.length) {
    return null
  }

  const columnDelimiter = ','
  const lineDelimiter = '\n'

  let result = `${headers.map(h => (h.label)).join(columnDelimiter)}${lineDelimiter}`

  data.forEach((item) => {
    let ctr = 0
    headers.forEach((header) => {
      if (ctr > 0) result += columnDelimiter

      result += item[header.key]
      ctr++
    })
    result += lineDelimiter
  })

  return result
}
