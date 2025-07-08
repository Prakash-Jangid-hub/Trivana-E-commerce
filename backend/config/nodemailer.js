import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth:{
        user: "kanekiken8333@gmail.com",
        pass: "ipdypfzizpirhtbp"
    }
})

export default transporter