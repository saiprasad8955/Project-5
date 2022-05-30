const express = require("express");
const router = express.Router();

// IMPORTING CONTROLLERS
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const userController = require("../controllers/userController")
const orderController = require("../controllers/orderController")
const middleware = require('../middleware/authentication')


//----------- USER API'S
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', userController.getUserById)
router.put('/user/:userId/profile', userController.updateUserById)

//----------- PRODUCT API'S
router.post('/products', productController.createProduct)
router.get('/products', productController.getProducts)
router.get('/products/:productId', productController.getProductsById)
router.put('/products/:productId', productController.updateProductById)
router.delete('/products/:productId', productController.deleteProductById)

//----------- CART API'S(PROTECTED ROUTES)
router.post('/users/:userId/cart', cartController.createCart)
router.put('/users/:userId/cart', cartController.updateCartById)
router.get('/users/:userId/cart', cartController.getCartById)
router.delete('/users/:userId/cart', cartController.deleteCartById)

//----------- ORDER API'S
router.post('/users/:userId/orders', orderController.placeOrder)
router.put('/users/:userId/orders', orderController.updateOrderById)

// EXPORTING ROUTER
module.exports = router;