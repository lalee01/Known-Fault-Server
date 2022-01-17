"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = __importDefault(require("../models/user.model"));
const googleClient = new google_auth_library_1.OAuth2Client({
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
});
const authenticateUser = async (req, res) => {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: `${process.env.GOOGLE_CLIENT_ID}`,
    });
    const payload = ticket.getPayload();
    let user = await user_model_1.default.findOne({ email: payload?.email });
    if (!user) {
        user = await new user_model_1.default({
            email: payload?.email,
            avatar: payload?.picture,
            name: payload?.name,
        });
        await user.save();
    }
    res.json({ user, token });
};
exports.authenticateUser = authenticateUser;
