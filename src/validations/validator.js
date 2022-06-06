const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const isValidobjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (!(/^[A-Za-z ]+$/.test(value))) {
        return false
    }
    return true;
}

const isValidEmail = function (value) {
    if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return false
    }
    return true
}

const isValidNumber = function (value) {
    if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(value))) {

        return false
    }
    return true
}

const isValidName = function (value) {
    if (!(/^[A-Za-z ]+$/.test(value))) {
        return false
    }
    return true
}

const isValidPassword = function (value) {
    if (!(/^(?!\S*\s)(?=\D*\d)(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z]).{8,15}$/.test(value))) {
        return false
    }
    return true
}

const hashedPassword = async (password) => {
    let pass = await bcrypt.hash(password, 10)
    return pass;
}

const isValidPincode = function (value) {
    if (!(/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value))) {
        return false
    }
    return true
}

const isValidPrice = function (value) {
    if (/^\d+(\.\d{1,2})?$/.test(value)) return true
    return false
}


const isValidSize = (Arr) => {

    let newArr = []
    if (Arr.length === 0) { return false };
    let brr = Arr[0].split(',')
    for (let i = 0; i < brr.length; i++) {
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(brr[i].toUpperCase())) { return false; }
        newArr.push(brr[i].toUpperCase())
    }
    return newArr
}

const isvalidCurrencyId = function (currencyId) {
    return ["INR"].indexOf(currencyId) !== -1
}
const isvalidCurrencyFormat = function (currencyFormat) {
    return ["₹"].indexOf(currencyFormat) !== -1
}

const isvalidNum = function (value) {
    if (!/^[0-9]+$/.test(value)) {
        return false
    }
    return true
}

const isValidremoveProduct = function (value) {
    return [0, 1].indexOf(value) !== -1
}

const isValidStatus = function (value) {
    return ["pending", "completed", "cancelled"].indexOf(value) !== -1
}

const isValidImage = (image) => {
    if ((/.*\.(jpeg|jpg|png)$/).test(image.originalname)) return true;
    return false
}


const isValidBoolean = (value) => {
    return (value === 'true' || value === 'false')
}

module.exports = {
    isValid,
    isValidBody,
    isValidobjectId,
    isValidString,
    isValidEmail,
    isValidNumber,
    isValidName,
    isValidPassword,
    isValidPincode,
    isValidPrice,
    isValidSize,
    isvalidNum,
    isvalidCurrencyId,
    isvalidCurrencyFormat,
    isValidremoveProduct,
    isValidStatus,
    isValidImage,
    isValidBoolean,
    hashedPassword
}