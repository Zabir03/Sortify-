import mongoose from 'mongoose'

export const DEFAULT_CATEGORY_NAMES = [
    'All',
    'Placement',
    'NPTEL',
    'HOD',
    'E-Zone',
    'Promotions',
    'Whats happening',
    'Professor',
    'Other'
]

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    color: {
        type: String,
        default: '#6B7280'
    },
    userId: {
        type: String, // Optional, for user-specific categories
        index: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    classificationStrategy: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    patterns: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    keywords: [{
        type: String
    }],
    trainingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'basic'],
        default: 'pending'
    },
    mlServiceId: {
        type: String
    },
    sampleEmailIds: [{
        type: String
    }]
}, {
    timestamps: true
})

// Index for name to ensure uniqueness among global categories (where userId is undefined/null)
// We use a partial index for this if we supported user-specific categories with same names,
// but since the service seems to favor global categories, we'll try to enforce name uniqueness globally for now.
// However, to be safe, we'll just index name.
categorySchema.index({ name: 1 })

// Static method to ensure default categories exist
categorySchema.statics.getOrCreateDefaults = async function () {
    const defaults = [
        {
            name: 'All',
            description: 'Meta-category representing all emails',
            color: '#000000',
            isDefault: true,
            keywords: []
        },
        {
            name: 'Other',
            description: 'Miscellaneous emails that don\'t fit other categories',
            color: '#6B7280',
            isDefault: true,
            keywords: ['other', 'misc', 'general']
        },
        {
            name: 'Placement',
            description: 'Job placement opportunities, recruitment drives, and career-related communications',
            color: '#3B82F6',
            isDefault: true,
            keywords: ['placement', 'job', 'recruitment', 'interview', 'career']
        },
        {
            name: 'NPTEL',
            description: 'NPTEL course registrations, lectures, and online learning content',
            color: '#8B5CF6',
            isDefault: true,
            keywords: ['nptel', 'course', 'lecture', 'assignment', 'exam']
        },
        {
            name: 'HOD',
            description: 'Communications from Head of Department',
            color: '#EF4444',
            isDefault: true,
            keywords: ['hod', 'head', 'department', 'notice']
        },
        {
            name: 'E-Zone',
            description: 'Student portal E-Zone related communications',
            color: '#10B981',
            isDefault: true,
            keywords: ['ezone', 'portal', 'login', 'password', 'result']
        },
        {
            name: 'Promotions',
            description: 'Marketing emails, promotional content, deals, and offers',
            color: '#F59E0B',
            isDefault: true,
            keywords: ['offer', 'discount', 'sale', 'promotion']
        },
        {
            name: 'Whats happening',
            description: 'Campus events, announcements, and activities',
            color: '#EC4899',
            isDefault: true,
            keywords: ['event', 'happening', 'campus', 'activity']
        },
        {
            name: 'Professor',
            description: 'Communications from professors and faculty',
            color: '#6366F1',
            isDefault: true,
            keywords: ['professor', 'faculty', 'class', 'assignment']
        }
    ]

    const categories = []

    for (const def of defaults) {
        // Check for existing category by name, preferring default ones
        let cat = await this.findOne({ name: def.name })

        if (!cat) {
            cat = await this.create(def)
            console.log(`Created default category: ${def.name}`)
        } else if (!cat.isDefault) {
            // If it exists but wasn't marked default, mark it (migration)
            cat.isDefault = true
            cat.description = def.description
            cat.color = def.color
            await cat.save()
        }
        categories.push(cat)
    }

    // Also return any other active categories
    const defaultNames = defaults.map(d => d.name)
    const others = await this.find({
        name: { $nin: defaultNames },
        isActive: true
    })

    return [...categories, ...others]
}

categorySchema.statics.createFromTemplate = async function (templateName, templateData) {
    return this.create({
        name: templateData.name,
        description: templateData.description,
        color: templateData.color,
        keywords: templateData.keywords,
        classificationStrategy: templateData.classificationStrategy,
        isDefault: false
    })
}

const Category = mongoose.model('Category', categorySchema)

export default Category
