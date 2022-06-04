const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        refs: 'USER',
        required: true,
        unique: true
    },
    items: [{
        productId: {
            type: ObjectId,
            refs: 'PRODUCT',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            minlength: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,

    },
    totalItems: {
        type: Number,
        required: true,
    },

}, { timestamps: true })

module.exports = mongoose.model("CART", cartSchema)