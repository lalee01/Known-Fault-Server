var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { OAuth2Client } from "google-auth-library";
import User from "./../models/user.model.js";
const googleClient = new OAuth2Client({
    clientId: `631569155937-29nbo6s1ef26apovtsdjp891pdkjq902.apps.googleusercontent.com`,
});
export const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const ticket = yield googleClient.verifyIdToken({
        idToken: token,
        audience: `631569155937-29nbo6s1ef26apovtsdjp891pdkjq902.apps.googleusercontent.com`,
    });
    const payload = ticket.getPayload();
    let user = yield User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!user) {
        user = yield new User({
            email: payload === null || payload === void 0 ? void 0 : payload.email,
            avatar: payload === null || payload === void 0 ? void 0 : payload.picture,
            name: payload === null || payload === void 0 ? void 0 : payload.name,
        });
        yield user.save();
    }
    res.json({ user, token });
});
export default authenticateUser;
