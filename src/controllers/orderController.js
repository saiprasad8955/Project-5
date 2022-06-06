const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const validator = require('../validations/validator')
const { isValid } = require("ipaddr.js")

//------------------ PLACING OR CREATING AN ORDER
const placeOrder = async (req, res) => {

    try {

        const userId = req.params.userId

        if(! validator.isValidBody(userId)) {
            return res.status(400).send({ status: false, message: 'Please enter valid user ID' });
        }

        // Authorization
        if(req.userId !== userId) {
           return res.status(403).send({ status: false,message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`});
        }

        const userDoc = await userModel.findById(userId) 

        if(userDoc === null) {
            return res.status(404).send({ status: false, message: 'User does not exist in DB' }); 
        }

        let data = { ...req.body }; // req.body does not have a prototype; creating a new object (prototype object associates by default)

        if (! validator.isValidBody(data)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }
        
        let { cartId, cancellable, ...remaining} = data

        if(validator.isValidBody(remaining)){
            return res.status(400).send({status: false, message: 'only cart ID is needed...'})
        }

        if(cancellable && ! validator.isValidBoolean(cancellable)){
            return res.status(400).send({status: false, message: 'please provide valid boolean value'})
        }

        const cart = await cartModel.findOne({_id: cartId, userId: userId}).select({items: 1 , totalPrice: 1, totalItems: 1})

        if(! cart || cart.items.length == 0 ){
            return res.status(404).send({ status: false, message: 'Cart does not exist or may be already Empty' });
        }

        const items = cart.items
        const totalPrice = cart.totalPrice
        const totalItems = cart.totalItems
        let totalQuantity = null


        if(!Array.isArray(items) || items.length == 0) {
            return res.status(400).send({ status: false, message: ` invalid input - Items` })
        }

        for(let i = 0 ; i < items.length ; i++) {

            let productId = items[i].productId

            if(! validator.isValid(productId)){
                return res.status(400).send({ status: false, message: `ProductId is empty`});
            }

            if( ! validator.isValidobjectId(productId)) {
                return res.status(400).send({ status: false, message: `ProductId is not valid Id`});
            }

            let product = await productModel.findOne({ _id: productId , isDeleted: false})

            if(!product) {
                return res.status(404).send({ status: false, message: `product does not exist`});
            }

            let quantity = items[i].quantity // check later
            if(isNaN(quantity) || quantity <= 0) {
                return res.status(400).send({ status: false, message: `Quantity should be a minimum 1` }) 
            }
            totalQuantity += quantity

        }

        if(isNaN(totalPrice) ){
            return res.status(400).send({ status: false, message: `Total Price Should Be A Number` })
        }

        if (isNaN(totalItems)) {
            return res.status(400).send({ status: false, message: `Total items Should Be A Number` })
        }

        let orderObj = {
            userId,
            items,
            totalPrice,
            totalItems,
            totalQuantity,
            cancellable : cancellable
        }
       

        const newOrder = await orderModel.create(orderObj)

        const updated_Cart = await cartModel.findOneAndUpdate( {_id: cartId, userId : userId},
            { $set : { items : [] , totalPrice : 0 , totalItems : 0} }, {new : true} 
        )

        return res.status(200).send({status: true, message: 'Order placed Successfully' , data: newOrder})

        
    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });       
    }

};


//------------------ UPDATING ORDER BY ID
const updateOrderById = async (req, res) => {

    try {

        const userId = req.params.userId

        if(! validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Please enter valid user ID' });
        }
        
        const userDoc = await userModel.findById(userId) 

        if(userDoc === null) {
            return res.status(404).send({ status: false, message: 'User does not exist in DB' }); 
        }

        // Authorization
        if(req.userId !== userId) {
            return res.status(403).send({ status: false,message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`});
        }

        if (! validator.isValidBody(req.body)) {
            return res.status(400).send({ status: false, message: `Invalid Input Parameters` })
        }
       
        const data = { ...req.body }

        let { orderId, status } = data

        if(!data.hasOwnProperty('orderId')) {
            return res.status(400).send({ status: false, message: `Order Id Should Be Present In RequestBody` })
        }

        if(! validator.isValid(orderId)){
            return res.status(400).send({status: false, message: 'order Id is required!!!'})
        }

        if(! validator.isValidobjectId(orderId)){
            return res.status(400).send({status: false, message: 'Please enter valid order Id '})
        }

        const isOrderExist = await orderModel.findOne({_id: orderId, isDeleted: false})

        if(!isOrderExist){
            return res.status(400).send({status: false, message:`Order not found for this user`})
        }

        if(isOrderExist.userId.toString() !== userId) {
            return res.status(400).send({status: false, message:`Order does not belong to user`})
        }

        if (!data.hasOwnProperty('status')) {
            return res.status(400).send({ status: false, message: `Status Should Be Present In Request Body` })
    
        }

        if(status && !["completed", "cancelled"].includes(status)) {
            return res.status(400).send({status: false, message: `Status can be changed from pending to cancelled or completed only`})
        }

        if(isOrderExist.status == 'completed' || isOrderExist.status == 'cancelled') {
            return res.status(400).send({status: false, message: `Th order has been ${isOrderExist.status} already`})
        }

        if(isOrderExist.cancellable == false && status == 'cancelled') {
            return res.status(400).send({status: false, message: `Order can not be cancelled`})
        }
        
        const updatedData = await orderModel.findOneAndUpdate({_id: orderId}, {$set : {status: status}} , {new: true})
        
        return res.status(200).send({status: true, message:`order updated sucessfully` , data: updatedData})

        
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });        
    }
};

module.exports = {
    placeOrder,
    updateOrderById
}
