import mongoose from 'mongoose';

const FirmwareSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d+\.\d+\.\d+$/.test(v); // Формат X.Y.Z
      },
      message: props => `${props.value} is not a valid version format! Use X.Y.Z`
    }
  },
  type: {
    type: String,
    enum: ['device', 'stand', 'desktop'],
    required: true,
  },
  subType: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        if (this.type === 'device') {
          return ['express', 'voice', 'online'].includes(v);
        }
        return ['test-strips', 'devices'].includes(v);
      },
      message: props => `Invalid subType: ${props.value} for type ${this.type}`
    }
  },
  version_parsed: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 3 && v.every(num => Number.isInteger(num) && num >= 0);
      },
      message: props => `${props.value} is not a valid version_parsed format! Must be an array of 3 non-negative integers`
    }
  },
  file_path: {
    type: String,
    required: true,
  },
  file_size: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  device_type: {
    type: String,
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
  created_date: {
    type: Date,
  }
}, {
  timestamps: true,
});

FirmwareSchema.index({ type: 1, subType: 1, version: 1 }, { unique: true });

export default mongoose.model('Firmware', FirmwareSchema);