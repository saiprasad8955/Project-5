const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const validator = require('../validations/validator')

//------------------ PLACING OR CREATING AN ORDER
const placeOrder = async (req, res) => {

    try {

        // Extract userId From params
        let userId = req.params.userId;

        // Validate the UserId
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

        // Check Req Body has some value or not ?
        if (!validator.isValidBody(req.body)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }

        // Extract attributes from body by destructing
        let { items, totalPrice, totalItems, totalQuantity } = req.body

        // Check items are coming or not
        if (!req.body.hasOwnProperty('items')) {
            return res.status(400).send({ status: false, message: `Items Should Be present in request body` })
        }

        // Items should be an array and its length should not be zero
        if (!Array.isArray(items) || items.length == 0) {
            return res.status(400).send({ status: false, message: ` invalid input - Items` })
        }

        // check product id and quantity for items are valid or not
        for (let i = 0; i < items.length; i++) {

            if (!validator.isValidobjectId(items[i].productId)) {
                return res.status(400).send({ status: false, message: `${items[i].productId} is not a valid product id` })
            }

            if (!validator.isvalidNum(parseInt(items[i].quantity))) {
                return res.status(400).send({ status: false, message: "Quantity should be a natural number" })   // "4" =>    Number()
            }

        }

        // check Total Price is coming or not
        if (!req.body.hasOwnProperty('totalPrice')) {
            return res.status(400).send({ status: false, message: `total Price Should Be Presemt In Request Body` })
        }

        // Valid Total Price coming from body
        if (!validator.isvalidNum(totalPrice)) {
            return res.status(400).send({ status: false, message: `Total Price Should Be A Number` })
        }

        // check Total Items is coming or not
        if (!req.body.hasOwnProperty('totalItems')) {
            return res.status(400).send({ status: false, message: `total Price Should Be Present In Request Body` })
        }

        // Valid Total Items coming from body
        if (!validator.isvalidNum(totalItems)) {
            return res.status(400).send({ status: false, message: `Total items Should Be A Number` })
        }

        // check Total Quantity is coming or not
        if (!req.body.hasOwnProperty('totalQuantity')) {
            return res.status(400).send({ status: false, message: `total Quantity Should Be Present In Request Body` })
        }

        // Valid Total Quantity coming from body
        if (!validator.isvalidNum(totalQuantity)) {
            return res.status(400).send({ status: false, message: `Total quantity Should Be A Number` })
        }


        const newOrderData = {
            userId,
            items,
            totalPrice,
            totalItems,
            totalQuantity
        }

        const newOrder = await orderModel.create(newOrderData)
        res.status(201).send({ status: true, message: "Order Placed Successfully", data: newOrder })

    } catch (err) {

    }
};


//------------------ UPDATING ORDER BY ID
const updateOrderById = async (req, res) => {

    try {

        // Extract User ID from params
        let userId = req.params.userId.trim()

        // Validate the user ID
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is Not A Valid User Id` })
        }

        // Check user Exists or not 
        const isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: `userNot Found Please Check User Id` })
        }

        // Authorization
        if (isUserExist._id != req.userId) {
            return res.status(403).send({ status: false, message: `Unauthorized Request !` })
        }

        // Check body is coming or not
        if (!validator.isValidBody(req.body)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }

        // Destruct Request Body
        let { orderId, status } = req.body

        // check Request Body Has Order Id or not 
        if (!req.body.hasOwnProperty('orderId')) {
            return res.status(400).send({ status: false, message: `Order Id Should Be Present In RequestBody` })
        }

        // Check order id has value or not
        if (!validator.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Order id should be a valid string" })
        }
        orderId = orderId.trim()

        // Validate the orderId
        if (!validator.isValidobjectId(orderId)) {
            return res.status(400).send({ status: false, message: `${orderId} is Not A Valid Object Id` })
        }

        // Find order exists or not
        const isValidOrder = await orderModel.findById(orderId)
        if (!isValidOrder) {
            return res.status(404).send({ status: false, message: `No Order Found By This ${orderId} id` })
        }

        // Authorization
        if (isValidOrder.userId != userId) {
            return res.status(403).send({ status: false, message: `order ${orderId} Does Not Belongs To ${userId} user` })
        }

        // Check request has status or not
        if (!req.body.hasOwnProperty('status')) {
            return res.status(400).send({ status: false, message: `Status Should Be Present In Request Body` })
        }

        // Check request body is empty or not
        if (!validator.isValid(status)) {
            return res.status(400).send({ status: false, message: `Status should be a valid string` })
        }
        status = status.trim()

        // Validate Status
        if (!['completed', 'cancelled'].includes(status)) {
            return res.status(400).send({ status: false, message: `Status can be changed from pending to "cancelled" or "completed" only` })
        }

        // Check status is completed or cancelled so we will not update that 
        if (isValidOrder.status == 'completed' || isValidOrder.status == 'cancelled') {
            return res.status(400).send({ status: false, message: `The order has been ${isValidOrder.status} allready` })
        }

        // then check for cancellable is false and status cancelled
        if (isValidOrder.cancellable == false && status === 'cancelled') {
            return res.status(400).send({ status: false, message: `Order Cannot Be Cancelled ` })
        }

        // Finally update the order data
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId },
            { $set: { status: status } },
            { new: true })

        return res.status(200).send({ status: true, message: 'Order Updated Successfully', data: updatedOrder })

    } catch (err) {

    }
};

module.exports = {
    placeOrder,
    updateOrderById
}