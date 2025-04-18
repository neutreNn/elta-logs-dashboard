import mongoose from 'mongoose';

const ErrorLogSchema = new mongoose.Schema({
    parent_log_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Log' },
    viewed: { type: Boolean, default: false },
  
    // calibration data
    start_time: Date,
    calibration_source: String,
  
    // Добавленные из operator_settings
    operator_name: String,
    software_version_stand: String,
    hardware_version_stand: String,
    serial_number_ob_jlink: String,
    stand_id: String,
    device_type: String,
    device_firmware_version: String,
    device_firmware_version_parsed: [Number],
  }, {
    timestamps: true,
  });

const ErrorLog = mongoose.model('ErrorLog', ErrorLogSchema);
export default ErrorLog;
