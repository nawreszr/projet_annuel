-- Créer les bases de données
CREATE DATABASE IF NOT EXISTS courses;
CREATE DATABASE IF NOT EXISTS analytics;
CREATE DATABASE IF NOT EXISTS n8n;

-- Tables pour courses
\c courses;
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(500),
    instructor VARCHAR(255),
    category VARCHAR(100),
    level VARCHAR(50),
    duration INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
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

-- Insertion de cours de démonstration
INSERT INTO courses (title, description, price, instructor, category, level, duration, is_published) VALUES
('Introduction aux Microservices', 'Apprenez les bases des architectures microservices', 49.99, 'Dr. Jean Martin', 'Architecture', 'beginner', 240, true),
('Docker pour Débutants', 'Maîtrisez la containerisation avec Docker', 39.99, 'Sophie Dubois', 'DevOps', 'beginner', 180, true),
('API Design Patterns', 'Concevez des APIs robustes et évolutives', 59.99, 'Pierre Lambert', 'API', 'intermediate', 300, true),
('Kubernetes en Pratique', 'Déployez et gérez vos conteneurs', 79.99, 'Marie Bernard', 'DevOps', 'advanced', 360, true);

-- Tables pour analytics
\c analytics;
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
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
