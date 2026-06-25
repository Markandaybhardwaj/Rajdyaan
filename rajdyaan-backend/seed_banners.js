import mongoose from 'mongoose';
import Banner from './src/models/Banner.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_BANNERS = [
  {
    key: 'hero-1',
    label: 'Homepage Hero Slide 1',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778436876/heroBanner_1_iomhjf.png',
      publicId: 'rajdyaan/banners/heroBanner_1_iomhjf'
    },
    altText: 'Rajdhyaan — Premium Organic Honey, Ghee & Jaggery',
    link: '/products',
    section: 'homepage',
    isActive: true
  },
  {
    key: 'hero-2',
    label: 'Homepage Hero Slide 2',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778436896/HeroBanner_2_jcikhs.png',
      publicId: 'rajdyaan/banners/HeroBanner_2_jcikhs'
    },
    altText: 'Rajdhyaan — Farm Fresh Natural Sweeteners',
    link: '/products',
    section: 'homepage',
    isActive: true
  },
  {
    key: 'brand-story',
    label: 'Homepage Brand Story Image',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045254/rajdhyaan/brand-story.jpg',
      publicId: 'rajdyaan/banners/brand-story'
    },
    altText: 'Traditional Indian farmlands with mustard fields at golden hour',
    link: '',
    section: 'homepage',
    isActive: true
  },
  {
    key: 'b2b-collage',
    label: 'B2B Client Meetings Collage',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778068343/rajdhyaan/b2b-collage.jpg',
      publicId: 'rajdyaan/banners/b2b-collage'
    },
    altText: 'Rajdhyaan business meetings collage',
    link: '',
    section: 'b2b',
    isActive: true
  },
  {
    key: 'b2b-logistics',
    label: 'B2B Supply Chain & Logistics',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045241/rajdhyaan/b2b-logistics.jpg',
      publicId: 'rajdyaan/banners/b2b-logistics'
    },
    altText: 'Rajdhyaan Nationwide Logistics and Supply Chain',
    link: '',
    section: 'b2b',
    isActive: true
  },
  {
    key: 'b2b-jaggery-balls',
    label: 'B2B Jaggery Balls Product',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563196/JaggeryBalls_b2b_vqqu3m.png',
      publicId: 'rajdyaan/banners/JaggeryBalls_b2b_vqqu3m'
    },
    altText: 'Jaggery Balls | Laddu Gur',
    link: '',
    section: 'b2b',
    isActive: true
  },
  {
    key: 'b2b-jaggery-candy',
    label: 'B2B Jaggery Candy Product',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563173/JaggeryCandy_b2b_q7x8dp.png',
      publicId: 'rajdyaan/banners/JaggeryCandy_b2b_q7x8dp'
    },
    altText: 'Jaggery | Cubes | Candy | Barfi',
    link: '',
    section: 'b2b',
    isActive: true
  },
  {
    key: 'b2b-desi-khand',
    label: 'B2B Desi Khand Product',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563253/JeggeryKhand_b2b_logtwz.png',
      publicId: 'rajdyaan/banners/JeggeryKhand_b2b_logtwz'
    },
    altText: 'Desi Khand | Jaggery Powder',
    link: '',
    section: 'b2b',
    isActive: true
  },
  {
    key: 'logo',
    label: 'Main Site Logo',
    image: {
      url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1782302722/Rajdyan_Logo1_fkhmhu.png',
      publicId: 'rajdyaan/banners/logo'
    },
    altText: 'Rajdhyaan Logo',
    link: '/',
    section: 'general',
    isActive: true
  }
];

async function seedBanners() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected. Seeding banners...');

    // Clear existing banners
    await Banner.deleteMany({});

    const created = await Banner.insertMany(DEFAULT_BANNERS);
    console.log(`Successfully seeded ${created.length} banners.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedBanners();
