-- Table: tests
create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid references auth.users(id),
  status text default 'active',
  created_at timestamp with time zone default now()
);

-- Table: questions
create table if not exists questions (
  id text primary key,
  test_type text not null,
  question text not null,
  category text,
  prompt text
);

-- Table: responses
create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id),
  question_id text references questions(id),
  response text,
  created_at timestamp with time zone default now()
);

-- Table: results
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id),
  scores jsonb,
  summary text,
  created_at timestamp with time zone default now()
); 