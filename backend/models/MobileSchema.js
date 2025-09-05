import mongoose from 'mongoose';

const MobileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  files: [{
    file_path: { type: String, required: true },
    file_name: { type: String, required: true },
    file_size: { type: Number, required: true },
    file_type: { 
      type: String, 
      required: true,
      enum: ['Приложение', 'Спецификация', 'Изображение', 'Файл', 'Другое'] 
    },
    created_date: { type: Date, required: true, default: Date.now }
  }],
  upload_date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Mobile', MobileSchema);