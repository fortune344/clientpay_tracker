ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type text;

-- Policy to allow users to update their own premium status (for the mock upgrade button)
CREATE POLICY "Users can update their own premium status" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
