const validator = require("../validations/validator")
const productModel = require("../models/productModel")
const { uploadFile } = require('../AWS_S3/AWS_S3')
const { is } = require("express/lib/request");


//------------------ CREATING PRODUCT-------------------------------------------------//
const createProduct = async (req, res) => {
    try {

        // Extract data from request body
        let body = JSON.parse(JSON.stringify(req.body));

        // check Body is coming or not 
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Details First!!` })
        }

        // Get File for uploading Product Image
        let files = req.files;
        console.log(files);
        if (files && files.length > 0) {

            if (!validator.isValidImage(files[0])) {
                return res.status(400).send({ status: false, message: `Invalid Image Type` })
            }
            else if (files.length == 0) {
                return res.status(400).send({ status: false, msg: "No file to Write ! Please Add the Product Image" })
            }
        }

        // Upload file Now 
        let uploadedFileURL = await uploadFile(files[0]);

        // Destructing the request body
        let { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = body

        // Check title is coming or not 
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Title` })
        }

        // Validate the title
        if (!validator.isValidString(title)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Title` })
        }

        // Check Duplicate title is present or not
        let duplicateTitle = await productModel.findOne({ title: title, isDeleted: false })
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: `Product Already Exists with this title` })
        }

        // Check description is coming or not
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: `Please Enter Product description` })
        }

        // Validate the description
        if (!validator.isValidString(description)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Valid Product Description` })
        }

        // Check Price is Coming Or not
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Price` })
        }

        // console.log(typeof price);
        // Validate the price 
        if (!validator.isValidPrice(price)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Price` })
        }

        // Check CurrencyID is coming or not
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Currency ID` })
        }

        // Validate the CurrencyID 
        if (!validator.isvalidCurrencyId(currencyId)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Currency ID` })
        }

        // Check Currency Format is Coming or not
        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: `Please Enter Product Currency Format` })
        }

        // Validate the Currency Format 
        if (!validator.isvalidCurrencyFormat(currencyFormat)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Currency Format` })
        }

        // Validate the  style 
        if (style && !validator.isValidString(style)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Style` })
        }

        if( ! Array.isArray(availableSizes)){
            return res.status(400).send({ status: false, message: `Available Sizes Must be an Type Of Array` })
        }
        // Validate the Available Sizes 
        if (availableSizes && ! validator.isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Product Available Sizes` })
        }

        //  Validate Installments
        if((installments) &&  (! validator.isvalidNum(installments) || parseInt(Number(installments)) < 0) ){
            return res.status(400).send({ status: false , message: 'Please Enter Valid Installments'})
        }
        // Create a new Object and set all things
        let finalData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            productImage: uploadedFileURL,
            style,
            availableSizes : validator.isValidSize(availableSizes) ,
            installments
        }

        const newProduct = await productModel.create(finalData);
        return res.status(201).send({ status: true, message: 'Product Created Successfully', data: newProduct })

    } catch (err) {
        console.log("This is the error : ", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//------------------ GETTING PRODUCT-------------------------------------------------//
const getProducts = async (req, res) => {

    try {

        // check request params 
        const reqQuery = JSON.parse(JSON.stringify(req.query));

        // Destructure reqQuery
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = reqQuery

        // Create filter Query
        let filters = { isDeleted: false, deletedAt: null }

        // Check size is valid or not
        if (size) {
            size = [size].flat()
            if (!validator.isValidSize(size)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product Available Sizes` })
            }
            size = validator.isValidSize(size)
            filters.availableSizes = { $in: size };
        }

        // Check name is valid or not
        if (name) {
            if (!validator.isValidString(name)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product Name` })
            }
            filters.title = { $regex: name, $options: "i" } // options for case sensitive and regex is for finding one sentence also
        }


        // Check priceGreaterThan is valid or not
        if (priceGreaterThan || priceLessThan) {
            let filter = {};
            if (priceGreaterThan) {
                if (!validator.isvalidNum(priceGreaterThan)) {
                    return res.status(400).send({ status: false, message: `Please Enter Valid Price Greater Than Field` })
                }
                filter.$gt = priceGreaterThan

            }


            // Check name is valid or not
            if (priceLessThan) {
                if (!validator.isvalidNum(priceLessThan)) {
                    return res.status(400).send({ status: false, message: `Please Enter Valid Price Less Than Field` })
                }
                filter.$lt = priceLessThan

            }
            filters.price = filter; // price:{ $gt:greaterPrice, $lt:lessPrice }
        }

        // console.log(filters)
        // check price sort is valid or not
        let sort = {};
        if (priceSort) {
            if (!['-1', '1'].includes(priceSort) || isNaN(priceSort)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Sorting Field i.e [-1, 1]` })
            }
            // set that price in sort object above if all ok
            sort.price = priceSort
        }

        // Now get products by calling in DB
        let dataByFilter = await productModel.find(filters).sort(sort)
        
        // if No Doc Found 
        if(dataByFilter.length == 0){
            return res.status(400).send({ status: true , msg:"Doc Not Found With these Filter"})   
        }    
        
        res.status(200).send({ status: true, msg: "Products Fetched Successfully", data: dataByFilter });

    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//------------------ GETTING PRODUCT BY ID ---------------------------------//
const getProductsById = async (req, res) => {

    try {

        // Extract product ID from params
        let productId = req.params.productId

        // Validate the Product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Product ID" })
        }

        // Check Product is Exists in Our Database or not
        let product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).send({ status: false, message: "No product with this ID exists" })
        }

        // Check Product is deleted or not
        if (product.isDeleted === true) {
            return res.status(400).send({ status: false, message: "Product is deleted" })
        }

        return res.status(200).send({ status: true, message: "Product Fetched Successfully", data: product })

    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//------------------ UPDATING PRODUCT BY ID --------------------------------------------------------//
const updateProductById = async (req, res) => {

    try {

        // extract body here
        let body = JSON.parse(JSON.stringify(req.body));

        // extract product id
        let productId = req.params.productId;

        // Extract file here to update
        let files = req.files;

        // Validate the request Body And check file is coming or not
        if (!(validator.isValidBody(body) || req.hasOwnProperty('files'))) {
            return res.status(400).send({ Statuss: false, message: "Please give input in request " })
        }

        // Validate product ID
        if (!validator.isValidobjectId(productId)) {
            return res.status(404).send({ status: false, message: "Product ID Not Valid" });
        }

        // Check product exists or not and should not be deleted
        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(404).send({ status: false, message: "Product Not Found or has been deleted" });
        }

        // Destructing request body
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = body;

        let updatedProductData = {};

        // Check title is valid or not
        if (title) {

            if (!validator.isValidString(title)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product Title` })
            }

            // Check Duplicate title is present or not
            let duplicateTitle = await productModel.findOne({ title: title, isDeleted: false })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: `Product Already Exists with this title` })
            }

            updatedProductData.title = title;
        }

        // Check description is Valid or not
        if (description) {
            if (!validator.isValidString(description)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product description` })
            }
            updatedProductData.description = description;
        }

        // Check price is Valid or not
        if (price) {
            if (!validator.isvalidNum(price)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product price` })
            }
            updatedProductData.price = price;
        }

        // Check isFreeShipping is Valid or not
        if (isFreeShipping) {

            if (!validator.isValidBoolean(isFreeShipping)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product isFreeShipping Field` })
            }
            updatedProductData.isFreeShipping = isFreeShipping;
        }

        // Check Style is Valid or not
        if (style) {

            if (!validator.isValidString(style)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product style` })
            }
            updatedProductData.style = style;
        }


        // Check Available Sizes is Valid or not
        if (availableSizes) {

            if (!Array.isArray(availableSizes)) {
                return res.status(400).send({ status: false, data: "Available Sizes Must be an Type Of Array" })
            }

            if (!validator.isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product Available Sizes` })
            }
            updatedProductData.availableSizes = validator.isValidSize(availableSizes);
        }

        // Check Available Sizes is Valid or not
        if (installments) {

            if (!validator.isvalidNum(installments)) {
                return res.status(400).send({ status: false, message: `Please Enter Valid Product Available Sizes` })
            }
            updatedProductData.installments = installments;
        }

        // Finally Now Update the File check file coming or not
        if (files && files.length > 0) {

            // Check Valid Image Type or not
            if (!validator.isValidImage(files[0])) {
                return res.status(400).send({ status: false, message: `Invalid Image Type` })
            }

            // Update the New Product Image
            let productImageLink = await uploadFile(files[0]);
            if (!productImageLink) {
                return res.status(400).send({ status: false, message: "Error in Uploading the File" });
            }
            updatedProductData.productImage = productImageLink;
        }

        // Finally Update the Product
        let upadatedProduct = await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: updatedProductData },
            { new: true });

        return res.status(200).send({ status: true, message: "Product updated successfully", data: upadatedProduct });

    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};

//------------------ DELETING PRODUCT------------------------------------------------------//
const deleteProductById = async (req, res) => {

    try {

        // Extract product ID from path params
        let productID = req.params.productId

        // Validate the product ID
        if (!validator.isValidobjectId(productID)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Product ID" })
        }

        // Check product exists in our database or not 
        let product = await productModel.findById(productID)
        if (!product) {
            return res.status(404).send({ status: false, message: "Product Not Found" })
        }

        // Check for deleted or not
        if (product.isDeleted === true) {
            return res.status(400).send({ status: false, message: "Product Already Deleted" })
        }

        // Finally delete the Product Now
        let deletedProduct = await productModel.findByIdAndUpdate(productID, { $set: { isDeleted: true, deletedAt: new Date().toISOString() } }, { new: true })
        return res.status(200).send({ status: true, message: "Product Deleted Successfully", data: deletedProduct })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

};

module.exports = {
    createProduct,
    getProducts,
    getProductsById,
    updateProductById,
    deleteProductById
}
