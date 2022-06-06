/////////////////////////  Aws s3 -- Connection ////////////////////////////////////////////////
const aws = require("aws-sdk")

// Connecting to AWS
aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise (function (resolve , reject){

        let s3 = new aws.S3({apiVersion: "2006-03-01"})

        let  uploadParams = {
            ACL: "public-read", // ACCESS CONTROL LIST
            Bucket: "classroom-training-bucket",
            Key: "groupno8/" + file.originalname,
            Body: file.buffer
        }
        
        s3.upload( uploadParams , function (err, data) {
            if(err){
                return reject({error: err})
            }
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}


module.exports = { uploadFile }