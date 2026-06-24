
-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_email TEXT,
  avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  game TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_all" ON testimonials FOR SELECT
  TO public USING (is_approved = true);
CREATE POLICY "testimonials_insert_all" ON testimonials FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "testimonials_update_own" ON testimonials FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "testimonials_delete_own" ON testimonials FOR DELETE
  TO authenticated USING (true);

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  bio TEXT,
  logo_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  total_sales INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sellers_select_all" ON sellers FOR SELECT
  TO public USING (true);
CREATE POLICY "sellers_insert_own" ON sellers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sellers_update_own" ON sellers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sellers_delete_own" ON sellers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create auth trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role, is_admin, two_factor_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'customer',
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_testimonials_updated_at ON testimonials;
CREATE TRIGGER handle_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_sellers_updated_at ON sellers;
CREATE TRIGGER handle_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Backfill existing auth users with profiles
INSERT INTO public.profiles (id, email, username, role, is_admin, two_factor_enabled)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)), 'customer', false, false
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create index for seller lookups
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
