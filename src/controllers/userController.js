const validator = require("../validations/validator")
const userModel = require("../models/userModel")
const { uploadFile } = require("../AWS_S3/AWS_S3")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//------------------ CREATING USER
const createUser = async (req, res) => {

  try {

    // Extract data from RequestBody
    const data = JSON.parse(JSON.stringify(req.body));

    // first Check request body is coming or not 
    if (!validator.isValidBody(data)) {
      res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide User details' })
      return
    }

    // Object Destructing
    let { fname, lname, email, phone, password, address } = data


    // Check Name is coming or not
    if (!validator.isValid(fname)) {
      res.status(400).send({ status: false, message: 'FirstName is mandatory' })
      return
    }

    // Check Name is valid or not 
    if (!validator.isValidString(fname)) {
      res.status(400).send({ status: false, message: 'FirstName is not a valid name' })
      return
    }

    let validString = /\d/;
    if (validString.test(fname))
      return res.status(400).send({ status: false, msg: "FirstName must be valid it should not contains numbers" });

    // Check Name is coming or not
    if (!validator.isValid(lname)) {
      res.status(400).send({ status: false, message: 'LastName is mandatory' })
      return
    }

    // Check Name is valid or not 
    if (!validator.isValidString(lname)) {
      res.status(400).send({ status: false, message: 'LastName is not a valid name' })
      return
    }

    if (validString.test(lname)) {
      return res.status(400).send({ status: false, msg: "LastName must be valid it should not contains numbers" });
    }

    // Get File for uploading Product Image
    let files = req.files;

    // File is coming or not
    if (files.length == 0) {
      return res.status(400).send({ status: false, msg: "No file to Write ! Please Add the Product Image" })
    }

    if (files && files.length > 0) {
      if (!validator.isValidImage(files[0])) {
        return res.status(400).send({ status: false, message: `Invalid Image Type` })
      }
    }

    // Upload file Now 
    let uploadedFileURL = await uploadFile(files[0]);

    // Check Phone Number is coming or not
    if (!validator.isValid(phone)) {
      res.status(400).send({ status: false, message: 'Phone number is mandatory' })
      return

    }

    // Validate the Phone Number
    if (!validator.isValidNumber(phone)) {
      res.status(400).send({ status: false, message: 'Phone number is not a valid' })
      return

    }

    // Check Duplicate Phone Number
    const isExistPhone = await userModel.findOne({ phone: phone })
    if (isExistPhone) {
      res.status(400).send({ status: false, message: 'This phone number belong to other user' })
      return
    }

    // Check Email is Coming or not 
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: 'Email is required' })
      return
    }

    // Validate Email
    if (!validator.isValidEmail(email)) {
      res.status(400).send({ status: false, message: 'Email is invalid' })
      return
    }

    // Check Duplicate Email 
    const isExistEmail = await userModel.findOne({ email: email })
    if (isExistEmail) {
      res.status(400).send({ status: false, message: 'This Email belong to other user' })
      return
    }

    // Check Password is Coming Or not 
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: 'password is required' })
      return
    }

    // Validate Password
    if (!validator.isValidPassword(password)) {
      res.status(400).send({ status: false, message: 'Password must be 8-15 characters long consisting of atleast one number, uppercase letter, lowercase letter and special character' })
      return
    }

    // Store hassPassword
    const hashPass = await validator.hashedPassword(password)
    data.password = hashPass

    if (!address) {
      res.status(400).send({ status: false, message: 'Address is required' })
      return
    }
    address = JSON.parse(address)
    //const {shipping , billing } = address

    if (!address.shipping) {
      res.status(400).send({ status: false, message: 'Shipping is required' })
      return
    }

    if (!validator.isValid(address.shipping.street)) {
      res.status(400).send({ status: false, message: 'Shipping street is required' })
      return
    }

    // Validate street
    if (!validator.isValidString(address.shipping.street)) {
      res.status(400).send({ status: false, message: 'Enter a valid Street' })
      return
    }

    if (!validator.isValid(address.shipping.city)) {
      res.status(400).send({ status: false, message: 'Shipping city is required' })
      return
    }

    // Validate city
    if (!validator.isValidString(address.shipping.city)) {
      res.status(400).send({ status: false, message: 'Enter a valid city name' })
      return
    }

    if (validString.test(address.shipping.city))
      return res.status(400).send({ status: false, msg: "City name must be valid it should not contains numbers" });

    if (!validator.isValid(address.shipping.pincode)) {
      res.status(400).send({ status: false, message: 'Shipping pincode is required' })
      return
    }

    // Validate pincode
    if (!validator.isValidPincode(address.shipping.pincode)) {
      res.status(400).send({ status: false, message: ` ${shipping.pincode}  is not valid city pincode` })
      return
    }
    if (!address.billing) {
      res.status(400).send({ status: false, message: 'billing is required' })
      return
    }

    if (!validator.isValid(address.billing.street)) {
      res.status(400).send({ status: false, message: 'Billing street is required' })
      return
    }

    // Validate street
    if (!validator.isValidString(address.billing.street)) {
      res.status(400).send({ status: false, message: 'Enter a valid billing street' })
      return
    }

    if (!validator.isValid(address.billing.city)) {
      res.status(400).send({ status: false, message: 'billing city is required' })
      return
    }

    // Validate city
    if (!validator.isValidString(address.billing.city)) {
      res.status(400).send({ status: false, message: 'Enter a valid billing city name' })
      return
    }

    if (validString.test(address.billing.city))
      return res.status(400).send({ status: false, msg: "billing city name must be valid it should not contains numbers" });

    if (!validator.isValid(address.billing.pincode)) {
      res.status(400).send({ status: false, message: 'billing pincode is required' })
      return
    }

    // Validate pincode
    if (!validator.isValidPincode(address.billing.pincode)) {
      res.status(400).send({ status: false, message: ` ${billing.pincode}  is not valid billing city pincode` })
      return
    }

    let finalData = {
      fname,
      lname,
      email,
      profileImage: uploadedFileURL,
      phone,
      password: hashPass,
      address
    }


    // Finally Create The User Details After Validation
    let userData = await userModel.create(finalData)
    res.status(201).send({ status: true, message: 'User created successfully', data: userData })

  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//------------------ USER LOGIN   
const loginUser = async (req, res) => {
  try {

    // Extract data from RequestBody
    let data = req.body

    // first Check request body is coming or not 
    if (!validator.isValidBody(data)) {
      return res.status(400).send({ status: false, Message: 'Invalid request parameters. Please provide User details' })
    }

    // Extract Email And Password
    const { email, password } = data

    // Check Email is Coming Or not 
    if (!validator.isValid(email)) {
      res.status(400).send({ status: false, message: 'Email is required' })
      return
    }

    // Validate Email
    if (!validator.isValidEmail(email)) {
      res.status(400).send({ status: false, message: 'Email is invalid' })
      return
    }

    // Check password is Coming Or not 
    if (!validator.isValid(password)) {
      res.status(400).send({ status: false, message: 'password is required' })
      return
    }

    // Validate password
    if (!validator.isValidPassword(password)) {
      res.status(400).send({ status: false, message: 'It is not valid password' })
      return
    }

    // Check Email and password is Present in DB  
    let user = await userModel.findOne({ email: email })

    if (!user || ! await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ status: false, msg: "Email or password does not match, Invalid login Credentials" })
    }
    // const hashPass = await validator.hashPassword(password)

    // Generate Token 
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: new Date().getTime() / 1000,
      },
      "$2b$10$Dx.w8Mt.uqF5y78DHE1Ya", { expiresIn: "1h" }
    )

    // Send the token to Response Header
    //res.header("x-api-key" , token)


    // send response to  user that Author is successfully logged in
    res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })

  }
  catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//------------------ GETTING USER BY ID
const getUserById = async (req, res) => {
 
  try {

    // Extract userId from Params
    let userId = req.params.userId;

    // if userId is not a valid ObjectId
    if (!validator.isValidobjectId(userId)) {
      return res.status(400).send({ status: false, message: "UserId is invalid" });
    }

    // if user does not exist
    let userDoc = await userModel.findById(userId);
    if (!userDoc) {
      return res.status(404).send({ status: false, message: "User does not exist" });
    }

    //📌 AUTHORISATION:
    if (req.userId !== userId) {
      return res.status(403).send({ status: false, message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}` });
    }

    // Finally fetch the user
    res.status(200).send({ status: true, message: "User Fetched Sucessfully", data: userDoc });

  } catch (err) {
    res.status(400).send({ status: false, message: "Internal Server Error", error: err.message });
  }

};

//------------------ UDATING USER BY ID
const updateUserById = async (req, res) => {

  try {

    // Store Requestbody in body
    const body = JSON.parse(JSON.stringify(req.body))

    // Validate body
    if (!validator.isValidBody(body)) {
      return res.status(400).send({ status: false, msg: "Details must be present to update" })
    }

    // Validate params
    userId = req.params.userId
    if (!validator.isValidobjectId(userId)) {
      return res.status(400).send({ status: false, msg: `${userId} is invalid` })
    }

    // Check user Exists or not
    const userFound = await userModel.findOne({ _id: userId })
    if (!userFound) {
      return res.status(404).send({ status: false, msg: "User does not exist" })
    }

    // AUTHORISATION
    if (userId !== req.userId) {
      return res.status(401).send({ status: false, msg: "Unauthorised access" })
    }

    let { fname, lname, email, phone, password, address, profileImage } = body;


    //Updating the fields
    let updatedData = {}
    if (validator.isValid(fname)) {
      updatedData['fname'] = fname
    }
    if (validator.isValid(lname)) {
      updatedData['lname'] = lname
    }

    // Updating of email
    if (validator.isValid(email)) {
      if (!validator.isValidEmail(email)) {
        return res.status(400).send({ status: false, msg: "Invalid email id" })
      }


      // Duplicate email
      const duplicatemail = await userModel.find({ email: email })
      if (duplicatemail.length) {
        return res.status(400).send({ status: false, msg: "email id already exist" })
      }
      updatedData['email'] = email
    }


    // Updating of phone
    if (validator.isValid(phone)) {
      if (!validator.isValidNumber(phone)) {
        return res.status(400).send({ status: false, msg: "Invalid phone number" })
      }

      // Duplicate phone
      const duplicatePhone = await userModel.find({ phone: phone })
      if (duplicatePhone.length) {
        return res.status(400).send({ status: false, msg: "phone number already exist" })
      }
      updatedData['phone'] = phone
    }

    // Updating of password
    if (password) {
      if (!validator.isValid(password)) {
        return res.status(400).send({ status: false, message: 'password is required' })
      }
      if (!validator.isValidPassword(password)) {
        return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
      }
      const encrypt = await bcrypt.hash(password, 10)
      updatedData['password'] = encrypt
    }

    //Updating the Address
    address = JSON.parse(address);
    // console.log(address);

    // updating address street
    if (address.shipping.street && !validator.isValidString(address.shipping.street)) {
      return res.status(400).send({ status: false, message: 'Shipping Street is Not Valid' });
    }
    updatedData['address.shipping.street'] = address.shipping.street

    
    // updating address city
    if (address.shipping.city && !validator.isValidString(address.shipping.city)) {
      return res.status(400).send({ status: false, message: 'Shipping city is Not Valid City' });
    }
    updatedData['address.shipping.city'] = address.shipping.city

    
    // updating address pincode
    if (address.shipping.pincode && !validator.isValidPincode(address.shipping.pincode)) {
      return res.status(400).send({ status: false, message: 'Invalid pincode' });
    }
    updatedData['address.shipping.pincode'] = address.shipping.pincode

    
    // updating billing street
    if (address.billing.street && !validator.isValidString(address.billing.street)) {
      return res.status(400).send({ status: false, message: 'Billing Street is Not Valid' });
    }
    updatedData['address.billing.street'] = address.billing.street

    
    // updating billing city
    if (address.billing.city && !validator.isValidString(address.billing.city)) {
      return res.status(400).send({ status: false, message: 'Billing city is Not Valid City' });
    }
    updatedData['address.billing.city'] = address.billing.city

    
    // updating billing pincode
    if (address.billing.pincode && !validator.isValidPincode(address.billing.pincode)) {
      return res.status(400).send({ status: false, message: 'Invalid pincode' });
    }
    updatedData['address.billing.pincode'] = address.billing.pincode


    //Updating the Profile Picture
    let files = req.files;

    if (files && files.length > 0) {
      if (!validator.isValidImage(files[0])) { return res.status(400).send({ status: false, message: "Invalid Image type" }) }
      let uploadedFileURL = await uploadFile(files[0]);
      if (uploadedFileURL) {
        updatedData['profileImage'] = uploadedFileURL
      }
    }
    const updated = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
    return res.status(200).send({ status: true, msg: "User Updated Successfully", data: updated })
  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }

};


module.exports = {
  createUser,
  loginUser,
  getUserById,
  updateUserById
}