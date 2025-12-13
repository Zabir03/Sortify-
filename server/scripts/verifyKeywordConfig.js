
import { KEYWORD_CATEGORIES } from '../src/config/keywordCategories.js';

try {
    console.log('Successfully imported KEYWORD_CATEGORIES');
    const categories = Object.keys(KEYWORD_CATEGORIES);
    console.log(`Found ${categories.length} categories:`, categories.join(', '));

    // Basic validation
    let keywordCount = 0;
    for (const cat of categories) {
        const config = KEYWORD_CATEGORIES[cat];
        if (config.primaryKeywords) keywordCount += config.primaryKeywords.length;
        if (config.secondaryKeywords) keywordCount += config.secondaryKeywords.length;
    }
    console.log(`Total keywords configured: ${keywordCount}`);

} catch (error) {
    console.error('Error importing config:', error);
    process.exit(1);
}
