import mongoose from 'mongoose'

const labelMappingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    description: {
        type: String,
        trim: true
    },
    matchType: {
        type: String,
        enum: ['exact', 'contains', 'regex'],
        default: 'exact'
    },
    regexPattern: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Ensure unique mapping for same label per user
labelMappingSchema.index({ userId: 1, label: 1 }, { unique: true })

const LabelMapping = mongoose.model('LabelMapping', labelMappingSchema)

export default LabelMapping
