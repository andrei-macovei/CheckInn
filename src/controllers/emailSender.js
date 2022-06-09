const nodemailer = require('nodemailer');

// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const domainName = 'localhost:8080';

// generates a token of random characters
function generateToken(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function sendTokenEmail(firstname, email, token){
    // var transp= nodemailer.createTransport({
	// 	service: "gmail",
	// 	secure: false,
	// 	auth:{//login credentials
	// 		user:"checkinn_dontreply@outlook.com",
	// 		pass:"tehniciWeb"
	// 	},
	// 	tls:{
	// 		rejectUnauthorized:false
	// 	}
	// });

	// Outlook email connection
	const transporter = nodemailer.createTransport({
		service: "hotmail",
		auth:{
			//login credentials
			user:"checkinn_dontreply@outlook.com",
			pass:"licenta2022"
		},
		tls:{
			rejectUnauthorized:false
		}
	})

	//generate html within email
	await transporter.sendMail({
		from:"checkinn_dontreply@outlook.com",
		to:email,
		subject:"Your new CheckInn account",
		html:
        `<h1>Welcome to CheckInn, ${firstname}</h1>

        <p>
            We are pleased to welcome you to the CheckInn community. 
            There is only one last thing to do to start searching for your dream destination:
            <a href="http://${domainName}/users/confirm/${email}/${token}">Confirm your email address</a>
        </p>`
	})
	console.log("Confirmation email sent to " + email);
}

async function sendResetEmail(email, token){
    var transp= nodemailer.createTransport({
		service: "hotmail",
		auth:{//login credentials
			user:"checkinn_dontreply@outlook.com",
			pass:"licenta2022"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//generate html within email
	await transp.sendMail({
		from:"checkinn_dontreply@outlook.com",
		to:email,
		subject:"Reset your CheckInn password",
		html:
        `<h1>Password Reset</h1>

        <p>
            A password reset attempt has been made for this account. If this was not you, ignore this e-mail. 
			If you wish to reset your password, follow this link: <a href="http://${domainName}/users/reset/${email}/${token}">Reset password</a>
        </p>`
	})
	console.log("Password reset email sent to " + email);
}

module.exports = {sendTokenEmail, generateToken, sendResetEmail};