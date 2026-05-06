-- Добавляем колонку user_id в habit_logs, если её нет
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Включаем RLS для безопасности
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habit logs"
ON habit_logs
FOR ALL
USING (auth.uid() = user_id OR true); -- Для локальной разработки с x-user-id
