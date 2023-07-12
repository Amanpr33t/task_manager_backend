const notFound = (req, res) => {
   
    try {
        res.status(404).send('route does not exist')
        throw new Error({msg:'Route not found'})
    } catch (error) {
        throw new Error(error)
    }
   
}
module.exports = notFound