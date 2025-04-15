import mongoose from "mongoose";

const OperatorNameSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model("OperatorName", OperatorNameSchema);
