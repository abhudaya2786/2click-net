-- Hinglish Normalizer / Field Workforce — PostgreSQL schema
-- Requires PostgreSQL 13+ (gen_random_uuid built-in) or: CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. यूजर प्रोफाइल टेबल
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. सभी बातचीत और कॉल्स का रिकॉर्ड (Instant Save)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('phone_call', 'in_person_meeting', 'voice_note')),
    contact_name VARCHAR(100),          -- जिससे बात हुई (क्लाइंट/वेंडर)
    contact_phone VARCHAR(20),
    raw_transcript TEXT,                -- बोली गई कच्ची बातचीत
    pure_hindi_text TEXT,               -- AI द्वारा सुधारा गया शुद्ध हिंदी टेक्स्ट
    pure_english_text TEXT,             -- फॉर्मल इंग्लिश टेक्स्ट
    summary TEXT,                       -- 3-लाइन समरी
    detected_dialect VARCHAR(100),      -- AI द्वारा पहचानी गई बोली
    detected_intent TEXT,               -- बिज़नेस उद्देश्य
    duration_seconds DOUBLE PRECISION,  -- कॉल/मीटिंग अवधि
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. टास्क और अगले दिन के रिमाइंडर्स
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    task_description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_due ON scheduled_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
