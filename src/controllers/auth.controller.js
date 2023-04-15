const db = require("../models");
const config = require("../config/auth.config");
const { user: User, role: Role, refreshToken: RefreshToken, pwdResets: PwdResets } = db;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const hulemail = require("../templates/hulemail");
const otpGenerator = require('otp-generator');
const { Op } = Sequelize = require('sequelize');


exports.signup = async (req, res) => {
	var { fullName, email, password, verificationCode, sendCode } = req.body;

	if (sendCode == true && (!fullName || !email || !password)) {
		res.status(400).send({ message: "Malformed request" });
		return;
	}

	if (sendCode == false && (!fullName || !email || !password || !verificationCode)) {
		res.status(400).send({ message: "Malformed request" });
		return;
	}

	var fixedFullName = fullName.trim();

	if (sendCode) {
		const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

		await db.emailVerification.destroy({
			where: {
				email
			}
		});

		await db.emailVerification.create({
			email,
			code: code
		});

		hulemail.send(email, "emailverification", fixedFullName, {
			code: code
		});

		res.status(200).json({
			message: "Email verification sent successfully"
		});

		console.log(`Sent verification code: ${fixedFullName} (${email})`);

		return;
	}

	// check if verificationCode is valid for email.
	var exists = await db.emailVerification.findOne({
		where: {
			email: email,
			code: verificationCode
		}
	});

	if (!exists) {
		res.status(400).send({ message: "Code invalid" });
		return;
	}

	await db.emailVerification.destroy({
		where: {
			email: email
		}
	});

	try {
		var passwordHash = bcrypt.hashSync(password, 8);

		let userData = {
			fullName: fixedFullName,
			email: email,
			password: passwordHash,
			solypay_id: "9294f014-67a3-445c-928d-ccdfbf83b43b",
			emailVerified: true
		};

		const user = await User.create(userData);

		if (req.body.roles) {
			Role.findAll({
				where: {
					name: {
						[Op.or]: req.body.roles
					}
				}
			}).then(roles => {
				user.setRoles(roles).then(() => {
					console.log(`Signed up: ${fixedFullName} (${email})`);

					return res.send({ message: "User was registered successfully!" });
				});
			});
		} else {
			// user role = 1
			user.setRoles([1]).then(() => {
				console.log(`Signed up: ${fixedFullName} (${email})`);

				return res.send({ message: "User was registered successfully!" });
			});
		}

	} catch (err) {
		return res.status(500).send({ message: err });
	}
};

exports.signin = (req, res) => {
	const { email, password } = req.body;

	if (!email) {
		res.status(400).send({ message: "Malformed request" });
		return;
	}

	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(async (user) => {
		if (!user) {
			return res.status(404).send({ message: "User Not found." });
		}

		const passwordIsValid = bcrypt.compareSync(
			req.body.password,
			user.password
		);

		if (!passwordIsValid) {
			return res.status(401).send({
				accessToken: null,
				message: "Invalid Password!"
			});
		}

		const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName }, config.secret, {
			expiresIn: config.jwtExpiration
		});
		RefreshToken.destroy({
			where: {
				userId: user.id,
				expiryDate: {
					[Op.lte]: new Date()
				  }
			}
		})
		let refreshToken = await RefreshToken.createToken(user);
		let authorities = [];
		user.getRoles().then(roles => {
			for (let i = 0; i < roles.length; i++) {
				authorities.push("ROLE_" + roles[i].name.toUpperCase());
			}

			console.log(`Logged in: ${email}`);

			res.status(200).send({
				id: user.id,
				fullName: user.fullName,
				email: user.email,
				roles: authorities,
				accessToken: token,
				refreshToken: refreshToken,
				kycRequired: !user.streetAddress || !user.phoneNumber || !user.identification
			});
		});
	}).catch(err => {
		res.status(500).send({ message: err.message });
	});
};

exports.refreshToken = async (req, res) => {
	const { refreshToken: requestToken } = req.body;
	if (requestToken == null) {
		return res.status(403).json({ message: "Refresh Token is required!" });
	}
	try {
		let refreshToken = await RefreshToken.findOne({ where: { token: requestToken, userId: req.userId } });

		if (!refreshToken) {
			res.status(403).json({ message: "Refresh token is not in database!" });
			return;
		}
		if (RefreshToken.verifyExpiration(refreshToken)) {
			RefreshToken.destroy({ where: { id: refreshToken.id } });

			res.status(403).json({
				message: "Refresh token was expired. Please make a new signin request",
			});
			return;
		}
		const user = await refreshToken.getUser();
		let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
			expiresIn: config.jwtExpiration,
		});

		console.log(`Refreshed token to: ${user.fullName}`);

		return res.status(200).json({
			accessToken: newAccessToken,
			refreshToken: refreshToken.token,
		});
	} catch (err) {
		return res.status(500).send({ message: err });
	}
};

exports.forgotPassword = async (req, res) => {
	const { email } = req.body;
	if (email == null) {
		return res.status(400).json({ message: "Malformed request." });
	}

	try {
		let user = await User.findOne({
			where: {
				email: email
			}
		});

		if (user == null)
			return res.status(404).json({ message: "This email doesn't exist" });

		const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

		await PwdResets.destroy({
			where: {
				userId: user.id
			}
		});

		await PwdResets.create({
			userId: user.id,
			code
		});

		// emailManager.send(email, "forgotpassword", user, {
		// 	code
		// });
		hulemail.send(email, "forgotpassword", user.fullName, {
			code
		});

		console.log(`Password reset email sent to: ${user.fullName} (${email})`);

		return res.status(200).json({ message: "Verification code sent successfully." });
	} catch (err) {
		return res.status(500).send({ message: err });
	}
};

exports.verifyVerificationCode = async (req, res) => {
	const { email, code, newPassword } = req.body;
	if (email == null || code == null || newPassword == null) {
		return res.status(400).json({ message: "Malformed request." });
	}

	try {
		let user = await User.findOne({
			where: {
				email: email
			}
		});

		if (user == null)
			return res.status(404).json({ message: "This email doesn't exist" });

		var exists = await PwdResets.findOne({
			where: {
				userId: user.id,
				code: code
			}
		});

		if (!exists)
			return res.status(400).json({ message: "Invalid verification code" });

		await PwdResets.destroy({
			where: {
				userId: user.id
			}
		});

		await User.update(
			{ password: bcrypt.hashSync(newPassword, 8) },
			{ where: { id: user.id } }
		);

		await RefreshToken.destroy({
			where: { userId: user.id }
		});

		console.log(`Password reset successful: ${user.fullName} (${user.email})`);

		return res.status(200).json({ message: "Password successfully changed" });
	} catch (err) {
		return res.status(500).send({ message: err });
	}
};

