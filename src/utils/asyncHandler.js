const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }




/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
*/
//_________________________Below code is only for practise purpose for above code __________________________________________

/* Technique 1 :_____________________

const func1 = (func2) => (val1, val2) => { 
      func2(val1, val2);  
}

const func2 = (val1, val2) => {    
    console.log(val1, val2)
}

func1(func2(1,2))

*/


/* Technique 2 :_________________________

const func1 = function(func2){
    const anonymous = function(val1, val2){
        func2(val1, val2)
    }
}

const func2 = function(val1, val2){
    console.log(val1, val2)
}

func1(func2(1,2))

*/
