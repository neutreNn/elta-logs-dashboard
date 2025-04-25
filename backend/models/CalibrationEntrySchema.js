import mongoose from "mongoose";

const CalibrationEntrySchema = new mongoose.Schema(
  {
    operator_settings_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OperatorSettings",
      required: true
    },
    stand_id: String,
    device_type: String,
    operator_name: String,
    start_time: Date,
    reference_voltage_steps: [
      {
        step: Number,
        voltage: String,
        rawVref: Number,
        uicRegVref: String,
      },
    ],
    dac_min_steps: [Number],
    dac_max_steps: [Number],
    dac_steps: [
      {
        dac_register: String,
        voltage: Number,
      },
    ],
    calibration_steps: {
      type: Map,
      of: [Number],
    },
    end_of_calibration: {
      sensor_voltage: Number,
      temperature: Number,
    },
    active_mode_current: Number,
    sleep_mode_current: [Number],
    average_sleep_mode_current: Number,
    serial_number: String,
    error_detected: Boolean,
    test_duration: String,
    calibration_successful: Boolean,
    calibration_source: String,
  },
  { timestamps: true }
);

export default mongoose.model("CalibrationEntry", CalibrationEntrySchema);