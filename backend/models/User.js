import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  rollNo: { type: String, unique: true },
  password: String,
  recognitionPoints: {
    type: Number,
    default: 0,
  }
});

export default mongoose.model("User", userSchema);
