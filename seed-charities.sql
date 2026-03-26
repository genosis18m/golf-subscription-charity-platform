-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Initial Charities Seed Data
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO charities (slug, name, tagline, description, logo_url, website_url, registration_number, is_active, is_featured) VALUES
('cancer-research-uk', 'Cancer Research UK', 'Fighting cancer, together', 'Funding pioneering cancer research and helping people understand the risks and prevention of cancer. Over 40 years of groundbreaking research.', 'https://via.placeholder.com/200?text=Cancer+Research+UK', 'https://www.cancerresearchuk.org', 'CC1084908', true, true),
('oxfam', 'Oxfam GB', 'Fighting poverty', 'Working to tackle inequality and alleviate suffering caused by poverty, disaster and injustice. Active in over 90 countries worldwide.', 'https://via.placeholder.com/200?text=Oxfam', 'https://www.oxfam.org.uk', 'CC202918', true, true),
('save-the-children', 'Save the Children UK', 'For every child, a fair chance', 'Providing emergency aid and developmental support to children in over 120 countries. Education, health, and child protection.', 'https://via.placeholder.com/200?text=Save+Children', 'https://www.savethechildren.org.uk', 'CC1011532', true, true),
('world-wildlife-fund', 'WWF UK', 'Conservation for a living planet', 'Protecting endangered wildlife and habitats. Working globally to ensure a future where people live in harmony with nature.', 'https://via.placeholder.com/200?text=WWF', 'https://www.wwf.org.uk', 'CC201707', true, false),
('amnesty-international', 'Amnesty International UK', 'Human rights for all', 'Fighting injustice and human rights abuses across the globe. Independent and impartial advocacy for human dignity.', 'https://via.placeholder.com/200?text=Amnesty', 'https://www.amnesty.org.uk', 'CC1051681', true, false),
('national-trust', 'The National Trust', 'A better future for everyone', 'Protecting landscapes, coastlines, and historic properties for future generations. Opening doors to nature and heritage.', 'https://via.placeholder.com/200?text=National+Trust', 'https://www.nationaltrust.org.uk', 'CC228349', true, false),
('royal-british-legion', 'Royal British Legion', 'Remembering, Supporting, Campaigning', 'Supporting current and ex-service personnel and their families. Housing, financial help, and companionship.', 'https://via.placeholder.com/200?text=RBL', 'https://www.britishlegion.org.uk', 'CC219279', true, true),
('mind-uk', 'Mind UK', 'Mental health support and campaigns', 'Providing information and support for anyone experiencing a mental health problem. Campaigning for mental health rights.', 'https://via.placeholder.com/200?text=Mind', 'https://www.mind.org.uk', 'CC219830', true, false),
('action-against-hunger', 'Action Against Hunger', 'Fighting hunger worldwide', 'Providing food security, clean water, healthcare and education in over 50 countries. No one left behind.', 'https://via.placeholder.com/200?text=Action+Hunger', 'https://www.actionagainsthunger.org.uk', 'CC1050775', true, false),
('gamesaid', 'GamesAid', 'Supporting childhood disadvantage', 'UK\'s video games industry charity. Supports children\'s charities across the UK, raising millions for vulnerable children.', 'https://via.placeholder.com/200?text=GamesAid', 'https://www.gamesaid.org', 'CC1084880', true, false);

-- Add charity events for featured charities
INSERT INTO charity_events (charity_id, title, description, event_date, location, is_published) 
SELECT id, 'Annual Fundraising Gala', 'Join us for an evening of golf, dinner, and silent auction to raise funds for cancer research.', NOW() + INTERVAL '30 days', 'Wentworth Golf Club, Surrey', true 
FROM charities WHERE slug = 'cancer-research-uk' LIMIT 1;

INSERT INTO charity_events (charity_id, title, description, event_date, location, is_published)
SELECT id, 'World Water Day Awareness Campaign', 'Highlighting the importance of clean water access globally.', NOW() + INTERVAL '25 days', 'Online', true
FROM charities WHERE slug = 'oxfam' LIMIT 1;

INSERT INTO charity_events (charity_id, title, description, event_date, location, is_published)
SELECT id, 'Children''s Day Celebration', 'Special day dedicated to child welfare and protection initiatives.', NOW() + INTERVAL '45 days', 'Multiple locations', true
FROM charities WHERE slug = 'save-the-children' LIMIT 1;

INSERT INTO charity_events (charity_id, title, description, event_date, location, is_published)
SELECT id, 'Royal British Legion Poppy Appeal', 'Annual appeal to raise funds and recognition for military veterans.', NOW() + INTERVAL '60 days', 'UK wide', true
FROM charities WHERE slug = 'royal-british-legion' LIMIT 1;
