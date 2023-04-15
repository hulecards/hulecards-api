const express = require("express");
const cors = require("cors");
const helmet = require('helmet')
const app = express();
const fileUpload = require('express-fileupload');
const bcrypt = require("bcryptjs");
const testingController = require("./controllers/testing.controller");
const { authJwt } = require("./middlewares");

require("dotenv").config();

app.use(fileUpload({
	createParentPath: true,
	useTempFiles: true,
	tempFileDir: '/tmp/',
	debug: false
}));

// var corsOptions = {
// 	origin: ["http://localhost:3000", "https://hulecards.com", "https://test.hulecards.com", "https://admin3283.hulecards.com"]
// };
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.set('trust proxy', true);
app.disable('x-powered-by');

// app.options('*', cors())

/* Error handler middleware */
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	console.error(err.message, err.stack);

	res.status(statusCode).json({ message: err.message });
	return;
});

app.use(function (req, res, next) {
	res.header(
		"Access-Control-Allow-Headers",
		"x-access-token, Origin, Content-Type, Accept"
	);
	next();
});

app.get("/letstestwiththisroute", [authJwt.verifyToken], testingController.test);

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/virtualcard.routes')(app);
require('./routes/cardactions.routes')(app);
require('./routes/checkout.routes')(app);
require('./routes/adminvirtualcard.routes')(app);
require('./routes/supportadmin.routes')(app);
require('./routes/paymentwebhook.routes')(app);
require('./routes/webhook.routes')(app);

require('./routes/admin/dashboard.route')(app);
require('./routes/admin/users.route')(app);

const db = require("./models");
db.sequelize.sync({ alter: false }).then(() => {
	// console.log('Drop and Resync Db');
	seed();
});

// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
	console.log(`=================================`);
	console.log(`\n`);
});

async function seed() {
	if (!(await db.role.findOne({ where: { id: 1 } }))) {
		db.role.create({
			id: 1,
			name: "user"
		});
	}

	if (!(await db.role.findOne({ where: { id: 2 } }))) {
		db.role.create({
			id: 2,
			name: "moderator"
		});
	}

	if (!(await db.role.findOne({ where: { id: 3 } }))) {
		db.role.create({
			id: 3,
			name: "admin"
		});
	}

	let email = "support@hulecards.com";
	if (!(await db.user.findOne({ where: { email: email } }))) {
		let user = await db.user.create({
			fullName: "Hule Cards Support",
			email: email,
			password: bcrypt.hashSync("i5kh3qx9yfthdTF", 8),
			solypay_id: "95db1e1e-1868-43ec-b75d-593b551e94d3",
			emailVerified: true
		});

		await user.setRoles([3]);
	}

	email = "supportteam@hulecards.com";
	if (!(await db.user.findOne({ where: { email: email } }))) {
		let user = await db.user.create({
			fullName: "Hule Cards Support Team",
			email: email,
			password: bcrypt.hashSync("jdn#ws3SSd$3S", 8),
			solypay_id: "95db1e1e-1868-43ec-b75d-593b551e94d3",
			emailVerified: true
		});

		await user.setRoles([3]);
	}
}