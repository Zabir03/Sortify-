import mongoose from 'mongoose'

const reclassificationJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // The service uses ObjectId explicitely
        required: true,
        index: true
    },
    categoryName: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    totalEmails: {
        type: Number,
        required: true,
        default: 0
    },
    processedEmails: {
        type: Number,
        default: 0
    },
    successfulClassifications: {
        type: Number,
        default: 0
    },
    failedClassifications: {
        type: Number,
        default: 0
    },
    totalBatches: {
        type: Number,
        default: 0
    },
    currentBatch: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingRate: Number,
    lastProgressUpdate: Date,
    elapsedSeconds: Number,
    estimatedSecondsRemaining: Number,
    estimatedCompletionTime: Date,
    estimatedTotalSeconds: Number,
    errorMessage: String,
    startedAt: Date,
    completedAt: Date,
    progressPercentage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

reclassificationJobSchema.index({ userId: 1, status: 1 })
reclassificationJobSchema.index({ userId: 1, categoryName: 1, createdAt: -1 })

reclassificationJobSchema.statics.getLatestForCategory = async function (userId, categoryName) {
    return this.findOne({
        userId,
        categoryName
    }).sort({ createdAt: -1 })
}

reclassificationJobSchema.statics.getActiveJobs = async function (userId) {
    return this.find({
        userId,
        status: { $in: ['pending', 'processing'] }
    }).sort({ createdAt: -1 })
}

const ReclassificationJob = mongoose.model('ReclassificationJob', reclassificationJobSchema)

export default ReclassificationJob
