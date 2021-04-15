
export default async (config) => {
  const filters = [
    { tag: /^BANANA$/ },
    { message: /BANANA/ },
    { message: /banana/ },
  ]

  return {
    filters,
  }
}
