-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE
USING (auth.uid() = id);

-- Create a view that links profiles with auth.users for provider information
-- In Supabase, provider info is in raw_app_meta_data
CREATE OR REPLACE VIEW public.profiles_with_auth AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  u.raw_app_meta_data->>'provider' AS provider
FROM public.profiles p
JOIN auth.users u ON p.id = u.id;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Determine name based on provider
  DECLARE
    provider_name TEXT := NEW.raw_user_meta_data->>'name';
    provider_email TEXT := COALESCE(NEW.raw_user_meta_data->>'email', NEW.email);
    provider_avatar TEXT := NEW.raw_user_meta_data->>'avatar_url';
    auth_provider TEXT := NEW.raw_app_meta_data->>'provider';
  BEGIN
    -- Different providers store data in different places
    IF auth_provider = 'google' THEN
      provider_name := COALESCE(NEW.raw_user_meta_data->>'full_name', provider_name);
      provider_avatar := COALESCE(NEW.raw_user_meta_data->>'picture', provider_avatar);
    END IF;

    INSERT INTO public.profiles (id, name, email, avatar_url, created_at, updated_at)
    VALUES (
      NEW.id, 
      provider_name,
      provider_email,
      provider_avatar,
      NOW(),
      NOW()
    );
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END
$$;

-- Insert existing users who don't have profiles
INSERT INTO public.profiles (id, name, email, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.raw_user_meta_data->>'name',
  COALESCE(au.raw_user_meta_data->>'email', au.email),
  au.raw_user_meta_data->>'avatar_url',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL; 