import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  rollNo: { type: String, unique: true },
  password: String,
  recognitionPoints: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  branch: {
    type: String,
  }
});

export default mongoose.model("User", userSchema);
