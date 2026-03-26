/**
 * Seed charity data — used as fallback when Supabase is not configured.
 * This keeps the app fully functional for demos and local dev.
 */

import type { Charity, CharityEvent } from '@/types';

const now = new Date().toISOString();

const EVENTS: Record<string, CharityEvent[]> = {
  'cancer-research-uk': [
    {
      id: 'e1',
      charity_id: 'c1',
      title: 'Golf Day for Research — Wentworth',
      description: 'Annual charity golf day at Wentworth Club. All proceeds fund clinical trials.',
      event_date: '2026-06-14',
      location: 'Wentworth Club, Surrey',
      image_url: null,
      is_published: true,
      created_at: now,
    },
    {
      id: 'e2',
      charity_id: 'c1',
      title: 'Summer Fundraising Gala',
      description: 'Black-tie dinner and auction in aid of cancer research.',
      event_date: '2026-07-22',
      location: 'The Savoy, London',
      image_url: null,
      is_published: true,
      created_at: now,
    },
  ],
  'british-heart-foundation': [
    {
      id: 'e3',
      charity_id: 'c2',
      title: 'Heart Health Golf Classic',
      description: 'A 36-hole charity golf event raising funds for heart disease research.',
      event_date: '2026-05-18',
      location: 'Royal Birkdale, Southport',
      image_url: null,
      is_published: true,
      created_at: now,
    },
  ],
  'macmillan-cancer-support': [
    {
      id: 'e4',
      charity_id: 'c3',
      title: 'World\'s Biggest Golf Day',
      description: 'Join thousands of golfers raising money for people living with cancer.',
      event_date: '2026-09-05',
      location: 'Courses nationwide',
      image_url: null,
      is_published: true,
      created_at: now,
    },
  ],
};

export const SEED_CHARITIES: Charity[] = [
  {
    id: 'c1',
    slug: 'cancer-research-uk',
    name: 'Cancer Research UK',
    tagline: 'Together we will beat cancer',
    description:
      'Cancer Research UK is the world\'s largest independent cancer research organisation. We fund scientists, doctors and nurses to help beat cancer sooner. Through our research, we\'ve helped double cancer survival rates in the UK over the last 40 years, but there is still much more to do. Together, we will beat cancer.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.cancerresearchuk.org',
    registration_number: '1089464',
    is_active: true,
    is_featured: true,
    total_raised: 4250000,
    supporter_count: 847,
    events: EVENTS['cancer-research-uk'],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'c2',
    slug: 'british-heart-foundation',
    name: 'British Heart Foundation',
    tagline: 'Fighting heart and circulatory disease',
    description:
      'We fund over £100 million of research each year into all heart and circulatory diseases and the things that cause them. Heart and circulatory disease kills a person in the UK every three minutes. But with your help, we can change that. Your support makes our work possible. Together, we can beat heartbreak forever.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.bhf.org.uk',
    registration_number: '225971',
    is_active: true,
    is_featured: true,
    total_raised: 3180000,
    supporter_count: 634,
    events: EVENTS['british-heart-foundation'],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'c3',
    slug: 'macmillan-cancer-support',
    name: 'Macmillan Cancer Support',
    tagline: 'No one should face cancer alone',
    description:
      'When you\'re living with cancer, you need practical, medical and financial support, not just someone to talk to. Macmillan can help with all of it. We provide specialist health care, information and financial support to people affected by cancer. We also look at the emotional, work and social effects that cancer can have, and we work with communities to improve cancer care.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.macmillan.org.uk',
    registration_number: '261017',
    is_active: true,
    is_featured: true,
    total_raised: 2760000,
    supporter_count: 512,
    events: EVENTS['macmillan-cancer-support'],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'c4',
    slug: 'age-uk',
    name: 'Age UK',
    tagline: 'Love later life',
    description:
      'We believe in a world where older people can love later life. Age UK provides services and support at a national and local level to inspire, enable and support older people. We stand up and speak for all those who have reached later life, and also protect the older people who are less able to speak for themselves.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.ageuk.org.uk',
    registration_number: '1128267',
    is_active: true,
    is_featured: false,
    total_raised: 1920000,
    supporter_count: 389,
    events: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'c5',
    slug: 'the-samaritans',
    name: 'Samaritans',
    tagline: 'Whatever you\'re going through, we\'ll face it together',
    description:
      'Samaritans is available round the clock, every single day of the year. Trained volunteers offer a safe place for people to talk any time they like, in their own way — whether that\'s by phone, email, letter or face-to-face in most of our branches. We believe it\'s better to talk about suicidal feelings than to act on them, and that\'s why Samaritans works to reduce the risk of suicide.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.samaritans.org',
    registration_number: '219432',
    is_active: true,
    is_featured: false,
    total_raised: 1540000,
    supporter_count: 318,
    events: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'c6',
    slug: 'save-the-children',
    name: 'Save the Children',
    tagline: 'The world\'s leading organisation for children',
    description:
      'Save the Children believes every child deserves the future they want. We work in over 100 countries, including the UK, to make the world a safer place for children. We do whatever it takes — every day and in times of crisis — transforming children\'s lives and the future we all share.',
    logo_url: null,
    banner_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
    gallery_urls: [],
    website_url: 'https://www.savethechildren.org.uk',
    registration_number: '213890',
    is_active: true,
    is_featured: false,
    total_raised: 2100000,
    supporter_count: 427,
    events: [],
    created_at: now,
    updated_at: now,
  },
];

export function getCharityBySlug(slug: string): Charity | null {
  return SEED_CHARITIES.find((c) => c.slug === slug) ?? null;
}

export function getFeaturedCharities(): Charity[] {
  return SEED_CHARITIES.filter((c) => c.is_featured && c.is_active);
}
