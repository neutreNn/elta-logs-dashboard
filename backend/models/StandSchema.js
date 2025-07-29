import mongoose from "mongoose";

const RepairHistorySchema = new mongoose.Schema({
  repair_date: {
    type: Date,
    default: Date.now
  },
  repair_description: {
    type: String,
    required: true
  },
  repaired_by: {
    type: String,
    required: true
  },
  repair_status: {
    type: String,
    enum: ['запланирован', 'в процессе', 'завершен'],
    default: 'запланирован'
  }
});

const StandSchema = new mongoose.Schema(
  {
    stand_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    software_version_stand: {
      type: String,
      default: ""
    },
    hardware_version_stand: {
      type: String,
      default: ""
    },
    serial_number_ob_jlink: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ['активен', 'требует обслуживания', 'в ремонте', 'не активен'],
      default: 'активен'
    },
    last_used: {
      type: Date,
      default: Date.now
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    repair_history: [RepairHistorySchema],
    scheduled_maintenance: {
      date: Date,
      description: String
    },
    additional_notes: {
      type: String,
      default: ""
    },
    additional_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model("Stand", StandSchema);