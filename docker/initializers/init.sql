DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dropbox') THEN
      CREATE DATABASE dropbox;
   END IF;
END
$$