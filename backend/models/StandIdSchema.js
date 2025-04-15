import mongoose from "mongoose";

const StandIdSchema = new mongoose.Schema({
  standId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model("StandId", StandIdSchema);