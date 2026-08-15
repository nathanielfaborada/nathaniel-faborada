-- ==============================================================================
-- DATABASE SCHEMA: portfolio_db
-- Portfolio Database Definition, Users Table & Initial Seed Data
-- ==============================================================================

-- Create Database (kung wala pa)
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- ------------------------------------------------------------------------------
-- 1. USERS / ADMIN AUTHENTICATION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 2. CREATIONS / PROJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS creations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'personal',
    project_date VARCHAR(50) NULL,
    description TEXT,
    notice TEXT,
    contributions JSON, -- JSON array ng contribution bullet points
    image_url TEXT,
    screenshots JSON,   -- JSON array ng screenshot URLs
    source_code_url TEXT,
    live_demo_url TEXT,
    tags JSON,          -- JSON array ng tech tags (e.g. ["React", "Node.js"])
    is_featured BOOLEAN DEFAULT FALSE,
    stars VARCHAR(50) DEFAULT '⭐',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    visibility_type VARCHAR(50) DEFAULT 'Public',
    repos_count INT DEFAULT 0,
    visit_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 4. WORK EXPERIENCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    role_title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL, -- NULL means "Present"
    description TEXT,
    employment_type VARCHAR(100), -- e.g., 'Internship', 'Freelance', 'Full-time'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- SEED DATA (INITIAL DATA INSERTION)
-- ==============================================================================

-- 1. Seed Admin User (Username: admin, Password: adminPassword123)
-- Password hash generated with bcrypt 10 salt rounds for 'adminPassword123'
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'faboradanathaniel@gmail.com',
    '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.qH1Q4d08q8v7QG9O8X1lMh6D5lJ/yia',
    'admin'
) ON DUPLICATE KEY UPDATE username=username;

-- 2. Seed Creations / Projects
INSERT INTO creations (title, category, description, notice, contributions, image_url, screenshots, source_code_url, live_demo_url, tags, is_featured, stars)
VALUES 
(
    'Immacullearn — Collaborative Learning System',
    'organization',
    'Immacullearn is a learning management system (LMS) built as a thesis project, designed for academic institutions. It supports three user roles — students, professors, and admin — each with their own dashboards, spaces, and task management tools.',
    'Interested in the full version? Email me at faboradanathaniel@gmail.com to get access.',
    JSON_ARRAY(
        'Architected and built the Admin, Student, and Teacher dashboards from scratch, each with role-specific tools for managing courses, records, and monitoring activity.',
        'Built REST APIs that auto-send invitation emails via Brevo, turning account onboarding into a one-click sign-up flow for students and teachers.',
        'Wrote the search, filtering, and role-based announcement logic so each user only sees data relevant to their role.',
        'Secured the platform with credential-based admin authentication and login.',
        'Mapped the entire system\'s data flow across Level 0–2 DFDs before writing a single line of backend code.'
    ),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777214107/image_23_mho4xg.png',
    JSON_ARRAY(
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777214107/image_23_mho4xg.png',
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777214093/image_25_bsmxwh.png'
    ),
    'https://github.com/Immaculearn',
    'https://immaculearn.online/',
    JSON_ARRAY('javascript', 'supabase', 'mysql', 'postgresql', 'expressJS'),
    TRUE,
    '⭐'
),
(
    'Kamada Logistics',
    'internship',
    'Contributed to the development of an HR module and Driver’s Companion App, focusing on UI/UX design, frontend development, and backend logic to improve user experience and navigation.',
    NULL,
    JSON_ARRAY(),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1784537972/Screenshot_2026-07-20_165850_nsmyvj.png',
    JSON_ARRAY('https://res.cloudinary.com/diwwqfwjb/image/upload/v1784537972/Screenshot_2026-07-20_165850_nsmyvj.png'),
    NULL,
    NULL,
    JSON_ARRAY('FlutterFlow', 'Supabase', 'Balsamiq'),
    FALSE,
    NULL
),
(
    'Jenather Auto Shop',
    'organization',
    'Jenather Auto Shop is a web-based system for managing an auto shop built with PHP, HTML, CSS, and MySQL. It allows customers to browse cars, while admins can manage inventory and update statuses through a dashboard.',
    NULL,
    JSON_ARRAY(
        'Built the customer-facing car browsing interface, letting shoppers explore available inventory in real time.',
        'Developed the admin dashboard for managing inventory and updating service/vehicle statuses.',
        'Designed the MySQL database schema to keep customer records, service history, and inventory organized in one place.',
        'Handled both frontend (HTML/CSS) and backend (PHP) integration end-to-end, connecting the UI to live database operations.'
    ),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777215842/image_27_nh2swg.png',
    JSON_ARRAY(
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777215842/image_27_nh2swg.png',
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777215843/image_28_drrmbv.png',
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777215854/image_29_usqjtf.png'
    ),
    'https://github.com/orgs/Jenather-Auto-Shop',
    NULL,
    JSON_ARRAY('php', 'mysql', 'supabase', 'html/css', 'Railway'),
    TRUE,
    '⭐'
),
(
    'Threads Clone',
    'organization',
    'Threads Clone is a RESTful API that replicates the core features of the Threads social media platform, built with JWT-based authentication for secure user sessions.',
    NULL,
    JSON_ARRAY(
        'Designed and built the RESTful API architecture for the entire platform — posting, replying, liking, reposting, and follow/unfollow logic.',
        'Implemented JWT-based authentication to secure user sessions across all protected endpoints.',
        'Built account management endpoints covering registration, login, profile updates, and OTP-based password reset.',
        'Developed search functionality for users, posts, and hashtags with query-based filtering.'
    ),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1784539422/Landing_Page_pbsfka.png',
    JSON_ARRAY(
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1784539422/Landing_Page_pbsfka.png',
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1784539415/Home_fdthib.png'
    ),
    'https://github.com/Treads-Clone',
    NULL,
    JSON_ARRAY('javascript', 'node.js', 'html/css', 'MySQL'),
    TRUE,
    '⭐'
),
(
    'New York Times',
    'personal',
    'A web application that fetches and displays articles from the New York Times API with responsive pixel-art cards.',
    NULL,
    JSON_ARRAY(
        'Designed and developed a pixel-art themed news aggregator using the New York Times API.',
        'Implemented responsive card-based grid layout for article display.'
    ),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777216379/image_30_tnmion.png',
    JSON_ARRAY(
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777216379/image_30_tnmion.png',
        'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777216387/image_31_avhzq0.png'
    ),
    'https://github.com/nathanielfaborada/appsdev-newyork-times',
    'https://nathanielfaborada.github.io/appsdev-newyork-times',
    JSON_ARRAY('nyt_api', 'html/css', 'javascript'),
    TRUE,
    '⭐'
),
(
    'Weather Website',
    'personal',
    'Built a weather forecasting app from the ground up with real-time, city-based search pulling live weather data.',
    NULL,
    JSON_ARRAY(
        'Built a weather forecasting app from the ground up with real-time, city-based search — type a city, get live conditions instantly.',
        'Wired up a third-party Weather API to pull and render live weather data on the fly.',
        'Designed a custom retro-pixel UI theme from scratch, giving the app a distinct visual identity instead of a generic weather-widget look.'
    ),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1784541342/Screenshot_2026-07-20_175423_smhi4h.png',
    JSON_ARRAY('https://res.cloudinary.com/diwwqfwjb/image/upload/v1784541342/Screenshot_2026-07-20_175423_smhi4h.png'),
    'https://github.com/nathanielfaborada/WeatherWeb',
    'https://panahon-mo.netlify.app/',
    JSON_ARRAY('html/css', 'javascript'),
    TRUE,
    '⭐'
),
(
    'ai-driven-post-creator',
    'personal',
    'This service automatically creates and publishes content to your Facebook page powered by AI on autopilot.',
    NULL,
    JSON_ARRAY(),
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1777217990/image_32_zir7lg.png',
    JSON_ARRAY('https://res.cloudinary.com/diwwqfwjb/image/upload/v1777217990/image_32_zir7lg.png'),
    'https://github.com/nathanielfaborada/ai-driven-post-creator',
    'https://www.facebook.com/profile.php?id=61561184012011',
    JSON_ARRAY('javascript', 'node.js', 'axios', 'google gemini api', 'mlbb hero api', 'facebook graph api v24.0'),
    TRUE,
    '⭐'
);

-- 3. Seed Organizations
INSERT INTO organizations (name, logo_url, visibility_type, repos_count, visit_url)
VALUES 
(
    'College of Mary Immaculate',
    'https://avatars.githubusercontent.com/u/10000001?v=4',
    'Public',
    5,
    'https://github.com/college-of-mary-immaculate'
),
(
    'Jenather Auto Shop',
    'https://avatars.githubusercontent.com/u/10000002?v=4',
    'Public',
    3,
    'https://github.com/Jenather-Auto-Shop'
),
(
    'Immaculearn',
    'https://avatars.githubusercontent.com/u/10000003?v=4',
    'Public',
    8,
    'https://github.com/Immaculearn'
),
(
    'Treads-Clone',
    'https://avatars.githubusercontent.com/u/10000004?v=4',
    'Public',
    4,
    'https://github.com/Treads-Clone'
);

-- 4. Seed Work Experiences
INSERT INTO work_experiences (company_name, company_logo_url, role_title, start_date, end_date, description, employment_type)
VALUES 
(
    'JCAS Logistics',
    NULL,
    'Internship Developer',
    '2025-04-01',
    '2025-05-31',
    'Contributed to the development of the HR module and Driver Companion App using FlutterFlow and Supabase.',
    'Internship'
),
(
    'JCAS Logistics',
    NULL,
    'Freelance Developer',
    '2025-06-01',
    '2025-09-30',
    'Handled frontend enhancements, backend API integrations, and system automation workflows.',
    'Freelance'
);
