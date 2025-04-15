import mongoose from "mongoose";

const OperatorSettingsSchema = new mongoose.Schema(
  {
    operator_name: String,
    com_ports: [String],
    application_start_time: String,
    software_version_stand: String,
    hardware_version_stand: String,
    serial_number_ob_jlink: String,
    stand_id: String,
    device_type: String,
    device_firmware_version: String,
    device_firmware_version_parsed: [Number],
  },
  { timestamps: true }
);

export default mongoose.model("OperatorSettings", OperatorSettingsSchema);