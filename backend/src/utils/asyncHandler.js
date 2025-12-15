const asyncHandler = (responseHandler) => {
    return (req, res, next) => {
        Promise.resolve(responseHandler(req, res, next))
        .catch((err) => next(err))
    }
}

export default asyncHandler