-- Create system_settings table for maintenance mode
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  maintenance_until timestamp with time zone,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read system settings (for maintenance check)
CREATE POLICY "Everyone can view system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can update system settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.system_settings (maintenance_mode, maintenance_message)
VALUES (false, 'System is currently under maintenance. Please check back later.');