const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
 }


export { asyncHandler }



// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
//_________________________Below code is only for practise purpose for above code __________________________________________

// const func1 = (func2) => (val1, val2) => {  // func1 definition
 
//     func2(val1, val2);  // func2 called
// }

// const func2 = (val1, val2) => {    // func2 definition
//     console.log("func 2", val1, val2)
// }

// func1(func2(11,33))  // func1 called
