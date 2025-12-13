import mongoose from 'mongoose'

const trainingSampleSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing as String for consistency with other models
        required: true,
        index: true
    },
    emailId: {
        type: String, // ObjectId string
        index: true
    },
    subject: String,
    body: String,
    html: String,
    from: mongoose.Schema.Types.Mixed, // Can be String or Object
    to: mongoose.Schema.Types.Mixed,
    date: Date,
    trueLabel: {
        type: String,
        required: true
    },
    predictedLabel: String,
    confidence: Number,
    labeledBy: {
        type: String,
        enum: ['correction', 'system'],
        default: 'system'
    },
    isValidated: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['user_correction', 'user_action', 'unsubscribe', 'auto'],
        default: 'auto'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
})

// Index for getting user stats
trainingSampleSchema.index({ userId: 1, source: 1 })

trainingSampleSchema.statics.getUserTrainingStats = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: userId.toString() } },
        {
            $group: {
                _id: null,
                totalSamples: { $sum: 1 },
                validatedCount: { $sum: { $cond: [{ $eq: ["$isValidated", true] }, 1, 0] } },
                correctionCount: { $sum: { $cond: [{ $eq: ["$source", "user_correction"] }, 1, 0] } },
                actionCount: { $sum: { $cond: [{ $eq: ["$source", "user_action"] }, 1, 0] } }
            }
        }
    ])

    if (result.length > 0) {
        const { _id, ...stats } = result[0]
        return stats
    }

    return {
        totalSamples: 0,
        validatedCount: 0,
        correctionCount: 0,
        actionCount: 0
    }
}

const TrainingSample = mongoose.model('TrainingSample', trainingSampleSchema)

export default TrainingSample
