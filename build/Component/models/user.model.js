import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        required: true,
    },
});
export default mongoose.model("User", UserSchema);
