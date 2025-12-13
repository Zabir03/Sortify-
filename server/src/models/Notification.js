import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Add index for faster queries
notificationSchema.index({ userId: 1, timestamp: -1 })
notificationSchema.index({ userId: 1, read: 1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
