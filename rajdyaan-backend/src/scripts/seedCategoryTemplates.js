// ---------------------------------------------------------------------------
// Seed Script: Set templateSlug on existing categories
// ---------------------------------------------------------------------------
// Run with:  node src/scripts/seedCategoryTemplates.js
//
// This maps each category to its frontend template.
// The product detail page reads category.templateSlug to decide which
// visual template to render (GheeTemplate, OilTemplate, etc.)
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Category from '../models/Category.js';

// ---------------------------------------------------------------------------
// Mapping: category name (case-insensitive match) → templateSlug
// ---------------------------------------------------------------------------
// Update these names to match YOUR actual category names in the database.
// The script does a case-insensitive regex match, so "Desi Ghee" matches "desi ghee".
// ---------------------------------------------------------------------------
const CATEGORY_TEMPLATE_MAP = [
  {
    namePattern: /ghee/i,
    templateSlug: 'ghee',
    defaultTrustBadges: [
      { icon: '🐄', label: 'A2 Cow Milk' },
      { icon: '🔬', label: 'Lab Tested' },
      { icon: '🚚', label: 'Free Shipping ₹499+' },
      { icon: '🌿', label: 'No Chemicals' },
    ],
  },
  {
    namePattern: /oil/i,
    templateSlug: 'oil',
    defaultTrustBadges: [
      { icon: '🫒', label: 'Cold Pressed' },
      { icon: '🔬', label: 'Lab Tested' },
      { icon: '🚚', label: 'Free Shipping ₹499+' },
      { icon: '💚', label: 'No Preservatives' },
    ],
  },
  {
    namePattern: /jaggery|khand|sweetener|sugar/i,
    templateSlug: 'sweetener',
    defaultTrustBadges: [
      { icon: '🌾', label: 'Farm Fresh' },
      { icon: '🔬', label: 'Lab Tested' },
      { icon: '🚚', label: 'Free Shipping ₹499+' },
      { icon: '🌿', label: 'Chemical Free' },
    ],
  },
  {
    namePattern: /saree|sari|textile|fabric/i,
    templateSlug: 'saree',
    defaultTrustBadges: [
      { icon: '🧵', label: 'Handcrafted' },
      { icon: '✅', label: 'Authentic Weave' },
      { icon: '🚚', label: 'Free Shipping' },
      { icon: '🔄', label: 'Easy Returns' },
    ],
  },
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const categories = await Category.find({});
    console.log(`\n📦 Found ${categories.length} categories:\n`);

    for (const cat of categories) {
      const mapping = CATEGORY_TEMPLATE_MAP.find((m) =>
        m.namePattern.test(cat.name)
      );

      if (mapping) {
        cat.templateSlug = mapping.templateSlug;
        cat.defaultTrustBadges = mapping.defaultTrustBadges;
        await cat.save();
        console.log(`  ✅ ${cat.name} → template: "${mapping.templateSlug}"`);
      } else {
        cat.templateSlug = 'sweetener';
        const sweetenerMapping = CATEGORY_TEMPLATE_MAP.find(m => m.templateSlug === 'sweetener');
        cat.defaultTrustBadges = sweetenerMapping ? sweetenerMapping.defaultTrustBadges : [];
        await cat.save();
        console.log(`  ⚪ ${cat.name} → template: "sweetener" (defaulted)`);
      }
    }

    console.log('\n🎉 Category templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedTemplates();
