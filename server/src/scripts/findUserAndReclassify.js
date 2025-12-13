
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { reclassifyAllEmailsWithRuleBased } from '../services/emailReclassificationService.js'
import Email from '../models/Email.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config({ path: '../.env' })
dotenv.config({ path: './.env' })
dotenv.config({ path: '../../.env' })

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify'
        console.log('📊 Connecting to MongoDB...')

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log('✅ Connected to MongoDB successfully')
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message)
        process.exit(1)
    }
}

const main = async () => {
    try {
        await connectDB()

        console.log('🔍 Finding user with most emails...')

        // Find user with most emails
        const userCounts = await Email.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ])

        if (userCounts.length === 0) {
            console.error('❌ No emails found in database for any user.')
            process.exit(0)
        }

        const targetUserId = userCounts[0]._id
        const emailCount = userCounts[0].count

        // Get user details
        const user = await User.findById(targetUserId)
        const userEmail = user ? user.email : 'Unknown'

        console.log(`✅ Found target user: ${userEmail} (ID: ${targetUserId})`)
        console.log(`📧 Email Count: ${emailCount}`)

        console.log('\n🚀 Starting Reclassification...')

        const startTime = Date.now()
        const result = await reclassifyAllEmailsWithRuleBased(targetUserId.toString(), {
            preserveManual: true,
            batchSize: 100
        })

        const duration = Math.floor((Date.now() - startTime) / 1000)

        console.log('\n' + '='.repeat(60))
        console.log('📊 RECLASSIFICATION METRICS')
        console.log('='.repeat(60))
        console.log(`✅ Reclassified: ${result.statistics.reclassifiedEmails}`)
        console.log(`⏭️  Skipped: ${result.statistics.skippedSameCategory + result.statistics.skippedManualEmails}`)
        console.log(`⏱️  Duration: ${duration}s`)
        console.log('='.repeat(60))

    } catch (error) {
        console.error('\n❌ Fatal error:', error)
    } finally {
        await mongoose.connection.close()
        process.exit(0)
    }
}

main()
