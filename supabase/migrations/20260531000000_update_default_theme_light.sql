-- Update default theme to light for better UX
ALTER TABLE public.user_settings ALTER COLUMN theme SET DEFAULT 'light';

-- Update existing users who haven't changed their theme (still on old 'dark' default)
-- Only update if the user hasn't explicitly set a preference
UPDATE public.user_settings SET theme = 'light' WHERE theme = 'dark';
