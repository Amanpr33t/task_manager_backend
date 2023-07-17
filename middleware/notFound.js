const notFound = (req, res) => {
    throw new Error('Route not found')
}
module.exports = notFound