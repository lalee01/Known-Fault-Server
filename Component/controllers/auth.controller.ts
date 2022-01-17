import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "./../models/user.model.js";

const googleClient = new OAuth2Client({
  clientId: `631569155937-29nbo6s1ef26apovtsdjp891pdkjq902.apps.googleusercontent.com`,
});

export const authenticateUser = async (req: Request, res: Response) => {
  const { token } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: `631569155937-29nbo6s1ef26apovtsdjp891pdkjq902.apps.googleusercontent.com`,
  });

  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload?.email });
  if (!user) {
    user = await new User({
      email: payload?.email,
      avatar: payload?.picture,
      name: payload?.name,
    });

    await user.save();
  }

  res.json({ user, token });
};
export default authenticateUser
