const pad = (number: number) => {
  if (number < 10) {
    return '0' + number
  }

  return number
}

export const todaysSlug = (): string => {
    const today = new Date()
    const year = today.getUTCFullYear()
    const month = pad(today.getUTCMonth() + 1)
    const day = pad(today.getUTCDate())
    return (`${year}-${month}-${day}`)
}
