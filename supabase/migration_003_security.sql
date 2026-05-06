-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Политики для users: пользователь может видеть только себя
CREATE POLICY "Users can see only their own profile" 
ON users FOR SELECT 
USING (id::text = current_setting('request.headers')::json->>'x-user-id');

-- Политики для tasks: доступ только к своим задачам
CREATE POLICY "Users can manage their own tasks" 
ON tasks FOR ALL 
USING (user_id::text = current_setting('request.headers')::json->>'x-user-id');

-- Политики для goals: доступ только к своим целям
CREATE POLICY "Users can manage their own goals" 
ON goals FOR ALL 
USING (user_id::text = current_setting('request.headers')::json->>'x-user-id');

-- Политики для habits: доступ только к своим привычкам
CREATE POLICY "Users can manage their own habits" 
ON habits FOR ALL 
USING (user_id::text = current_setting('request.headers')::json->>'x-user-id');

-- Политики для habit_logs: доступ только к своим логам
CREATE POLICY "Users can manage their own habit logs" 
ON habit_logs FOR ALL 
USING (user_id::text = current_setting('request.headers')::json->>'x-user-id');
