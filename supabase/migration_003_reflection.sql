-- Таблица дней наблюдения (рефлексии)
CREATE TABLE IF NOT EXISTS reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_hour INTEGER NOT NULL,
    end_hour INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    ai_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Таблица почасовых ответов
CREATE TABLE IF NOT EXISTS reflection_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reflection_id UUID REFERENCES reflections(id) ON DELETE CASCADE,
    hour INTEGER NOT NULL,
    thinking TEXT,
    feeling TEXT,
    energy TEXT,
    doing TEXT,
    wanting TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reflection_id, hour)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_responses_reflection_id ON reflection_responses(reflection_id);
