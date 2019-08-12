export default async (config) => {
  console.log(config)
  const filters = [
    { tag: /^SPRENGEL$/ },
    { message: /SPRENGEL/ },
  ]

  return {
    filters,
  }
}
