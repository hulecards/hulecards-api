const db = require("../models");
const functions = require("../shared/functions");

exports.allAccess = (req, res) => {
	res.status(200).send("Public Content.");
};
exports.userBoard = (req, res) => {
	res.status(200).send("User Content.");
};
exports.adminBoard = (req, res) => {
	res.status(200).send("Admin Content.");
};
exports.moderatorBoard = (req, res) => {
	res.status(200).send("Moderator Content.");
};
exports.kyc = async (req, res) => {
	const { streetAddress, phoneNumber } = req.body;

	if (!streetAddress || !phoneNumber || !req.files?.identification) {
		return res.status(400).json({ message: "Malformed request" });
	}

	let fileInfo = await functions.uploadFile(req, "identification");

	try {
		const [success] = await db.user.update(
			{ streetAddress, phoneNumber, identification: fileInfo.path },
			{ where: { id: req.userId } }
		);

		if (success) {
			console.log(`KYC filled: ${req.userId}`);

			return res.status(200).json({ message: "KYC information saved." });
		}
		else
			return res.status(404).json({ message: "No change detected" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};