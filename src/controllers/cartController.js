const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validations/validator')

const createCart = async (req, res) => {

    try {

        // Extract userId from params
        const userId = req.params.userId

        // console.log(userId)
        // Validate the userID 
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter a Valid userID" })
        }

        // User Exists or not
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "User not Found" });
        }

        // Authorization
        if (userId != req.userId) {
             return res.status(403).send({ status: false, message: "User not authorized to create a cart" })
        }

        // Extract Body from request
        const requestBody = req.body

        // check body is coming or not
        if (!validator.isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please Provide Details In The Body" })
        }

        // Extract data from req Body
        let { cartId, productId } = requestBody

        // if cart id present
        if ('cartId' in requestBody) {
            // check cart Id
            if (!validator.isValid(cartId)) {
                return res.status(400).send({ status: false, message: `Cart Id Should be not be Empty` })
            }

            cartId = cartId.trim()

            // Validate cart Id
            if (!validator.isValidobjectId(cartId)) {
                return res.status(400).send({ status: false, message: `Invalid Cart Id` })
            }
        }

        // Product Id is coming or not
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: "Enter the productId" });
        }
        productId = productId.trim()

        // Validate the product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Enter a valid productId" })
        }

        // Check Product exists or not
        const product = await productModel.findOne({ _id: productId, isDeleted: false }).lean().select({ price: 1 });

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        // check cart exists or not 
        let isCartExist = await cartModel.findOne({ userId: userId })

        // if not exists then create a new cart for that user
        if (!isCartExist) {

            let newCartData = {
                userId: userId,
                items:
                    [
                        {
                            productId: product._id,
                            quantity: 1
                        }
                    ],
                totalPrice: product.price,
                totalItems: 1
            }

            // finally create new cart
            const newCart = await cartModel.create(newCartData)
            return res.status(201).send({ status: true, message: "Cart Successfully Created", data: newCart })
        }


        // Now check for cart not exists
        if (!req.body.hasOwnProperty("cartId")) {
            return res.status(400).send({ status: false, msg: `Please Enter the Card Id for userId ${userId}` })
        }

        // check for cart id and user matches or not
        if (isCartExist._id != cartId) {
            return res.status(400).send({ Status: false, message: "Cart Id and user do not match" })
        }

        // Store Item Lists in a variable
        let itemLists = isCartExist.items;

        // Extracts only product ids
        let productIdLists = itemLists.map((item) => item = item.productId.toString())

        // match productid with items id and then update it 
        if (productIdLists.find((item) => item == (productId))) {

            // Now we update data
            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
                {
                    $inc: {
                        "items.$.quantity": + 1,
                        totalPrice: + product.price
                    }
                },
                { new: true })

            // finally send the updated cart 
            return res.status(200).send({ status: true, msg: "Cart Updated Successfully", data: updatedCart })
        }



        // if product Id and product does not match then we will add new item in items
        const addNewItem = await cartModel.findOneAndUpdate({ userId: userId },
            {
                $addToSet: { items: { productId: productId, quantity: 1 } },
                $inc: { totalPrice: + product.price, totalItems: +1 }
            },
            { new: true })

        // Send Response Of New Added Product in Cart 
        return res.status(201).send({ status: true, message: "New Item Added in Cart Successfully", data: addNewItem })


    } catch (err) {
        console.log("This is the error : ", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//------------------ GETTING CART BY ID
const updateCartById = async (req, res) => {

    try {

        // Extract userId from params
        let userId = req.params.userId.trim()

        // Validate UserId came from Params
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter a Valid UserID" });
        }

        // Check User Exists or not
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        // Authorization
        if (userId != req.userId) {
           return res.status(403).send({ status: false, message: "user not authorized to update cart" })
        }

        // Extract requestBody from reqbody
        const requestBody = req.body;

        // Validate the reqBody
        if (!validator.isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: `Invalid Request parameters` });
        }

        // Destruct the reqBody
        let { cartId, productId, removeProduct } = requestBody

        // Check Cart Exists or not
        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) {
            return res.status(404).send({ status: false, message: `Cart Not Found Please Check Cart Id` })
        }

        //  Check Cart ID is coming or not
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, message: `Please Enter A Cart ID` })
        }
        cartId = cartId.trim()

        // Validate the cart ID
        if (!validator.isValidobjectId(cartId)) {
            return res.status(400).send({ status: false, message: `invalid Cart Id` })
        }

        // Cart ID from user and cart ID from body matches or not 
        if (isCartExist._id != cartId) {
            return res.status(400).send({ status: false, message: "CartId and user do not match" })
        }

        //  Check  Product ID is coming or not
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: "enter the productId" })
        }
        productId = productId.trim()

        // Validate the Product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, message: "enter a valid productId" });
        }

        // Check Product exists or not
        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false }).lean()
        if (!isProductExist) {
            return res.status(404).send({ status: false, message: `Product Not Exists` })
        }

        // check remove product is coming or not in reqBody
        if (!req.body.hasOwnProperty('removeProduct')) {
            return res.status(400).send({ status: false, message: "removeProduct key Should Be present" })
        }

        // Check if remove is NAN then throw error
        if (isNaN(removeProduct)) {
            return res.status(400).send({ status: false, message: "Enter the valid value for removeProduct" })
        }

        // Remove Product should be 1 or 0
        if (!(removeProduct === 1 || removeProduct === 0)) {
            return res.status(400).send({ status: false, message: `invalid input - remove Product key Should Be a number 1 or 0` })
        }

        // Store items in a Variable
        const itemList = isCartExist.items
        
        // Take ID List in variable through map
        let idList = itemList.map((ele) => { ele = ele.productId.toString() })
        let index = idList.indexOf(productId)

        // Check if index is equal to -1 then throw error
        if (index == -1) {
            return res.status(400).send({ status: false, message: `Product Does Not Exist In Cart` })
        }

        // IF Remove Product is ZERO  
        if (removeProduct == 0 || (removeProduct == 1 && itemList[index]['quantity'] == 1)) {

            let productPrice = itemList[index].quantity * isProductExist.price

            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
                {
                    $pull: { items: { productId: productId } },
                    $inc: { totalPrice: - productPrice, totalItems: - 1 }

                }, { new: true })

            return res.status(200).send({ status: true, message: 'Sucessfully Removed Product', data: updatedCart })


        }

        // If Remove Product Key is ONE 
        if (removeProduct == 1) {

            console.log(isCartExist);
            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": productId },
                {
                    $inc: {
                        totalPrice: - isProductExist.price,
                        "items.$.quantity": -1
                    }

                }, { new: true })

            return res.status(200).send({ status: true, message: 'Sucessfully Removed Product', data: updatedCart })
        }
    }
    catch (err) {
        console.log("This is the error : ", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

};

//------------------ GETTING CART BY ID
const getCartById = async (req, res) => {

    try {

        // Extract userId from Params
        let userId = req.params.userId.trim()

        // Validate the user Id
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please enter valid Object Id" })
        }

        // check user Exists or not
        let userExist = await userModel.findById(userId)
        if (!userExist) {
            return res.status(404).send({ status: false, message: "User does not exist" })
        }

        //Authorization
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "User not authorized to view requested cart" })
        }

        //  Checck cart Exists or not
        let isCartExists = await cartModel.findOne({ userId: userId }).populate('items.productId')
        if (!isCartExists) {
            return res.status(404).send({ status: false, message: "Cart not found" })
        }

        // finally send the cart details to response
        return res.status(200).send({ status: true, message: "Cart Details Fetched Successfully", data: isCartExists })

    }
    catch (err) {
        return res.status(400).send({ status: false, message: err.message })
    }
};

//------------------ UPDATING CART
const deleteCartById = async (req, res) => {

    try {

        // Extract userId from Params
        let userId = req.params.userId.trim()

        // Validate the user Id
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid Object id" })
        }

        // check user Exists or not   
        let userExists = await userModel.findById(userId)
        if (!userExists) {
            return res.status(404).send({ status: false, message: "User with this user id does not exist" })
        }

        // Authorization
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "User not authorized to delete cart" })
        }

        // Check cart exists or not
        let isCartExists = await cartModel.findOne({ userId: userId })
        if (!isCartExists) {
            return res.status(404).send({ Status: false, message: "No cart exists For this user" })
        }

        // check items present or not
        if (isCartExists.items.length == 0) {
            return res.status(400).send({ status: false, message: "Can not delete empty cart" })
        }

        // finally update the cart
        let updatedCart = await cartModel.findOneAndUpdate({ userId: userId },
            {
                $set: { items: [], totalItems: 0, totalPrice: 0 }
            })


        return res.status(204).send({ status: true, message: "Cart Deleted Successfuly"})

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
};

module.exports = {
    createCart,
    updateCartById,
    getCartById,
    deleteCartById
}
