-- Note: PostgreSQL init scripts
-- On crée les bases de données simplement. 
-- Si elles existent déjà (ce qui n'arrive pas avec -v), le script s'arrêtera, ce qui est normal.

CREATE DATABASE courses;
CREATE DATABASE analytics;
CREATE DATABASE n8n;

-- Tables pour courses
\c courses;
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(500),
    instructor VARCHAR(255),
    instructor_id VARCHAR(255), -- INDISPENSABLE pour filtrer par instructeur
    category VARCHAR(100),
    level VARCHAR(50),
    duration INTEGER,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration INTEGER,
    "order" INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Insertion de cours de démonstration (Tarek Admin a l'ID '1' par défaut pour le test)
INSERT INTO courses (title, description, price, instructor, instructor_id, category, level, duration, is_published) VALUES
('Introduction aux Microservices', 'Apprenez les bases des architectures microservices', 49.99, 'Tarek Admin', '1', 'Architecture', 'beginner', 240, true),
('Docker pour Débutants', 'Maîtrisez la containerisation avec Docker', 39.99, 'Tarek Admin', '1', 'DevOps', 'beginner', 180, true);

-- Tables pour analytics
\c analytics;
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    event_type VARCHAR(100),
    course_id INTEGER,
    lesson_id INTEGER,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_event ON analytics_events(event_type);
CREATE INDEX idx_analytics_course ON analytics_events(course_id);

-- Tables pour n8n
\c n8n;
CREATE SCHEMA IF NOT EXISTS n8n;

\c learning_db;
GRANT ALL PRIVILEGES ON DATABASE courses TO admin;
GRANT ALL PRIVILEGES ON DATABASE analytics TO admin;
GRANT ALL PRIVILEGES ON DATABASE n8n TO admin;
