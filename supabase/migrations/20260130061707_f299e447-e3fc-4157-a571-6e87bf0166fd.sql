-- Create job_roles table for managing open positions
CREATE TABLE public.job_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_screenings table for screening history
CREATE TABLE public.cv_screenings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE CASCADE,
  job_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
  ats_score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected', 'review')),
  missing_keywords TEXT[],
  selection_reasons TEXT[],
  rejection_reasons TEXT[],
  screened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar_events table for interviews and tasks
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'task' CHECK (event_type IN ('interview', 'task', 'reminder', 'deadline')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  candidate_name TEXT,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emails table for email history
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_roles
CREATE POLICY "Users can view their own job roles" ON public.job_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job roles" ON public.job_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job roles" ON public.job_roles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job roles" ON public.job_roles FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for cv_screenings
CREATE POLICY "Users can view their own screenings" ON public.cv_screenings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own screenings" ON public.cv_screenings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own screenings" ON public.cv_screenings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own screenings" ON public.cv_screenings FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for calendar_events
CREATE POLICY "Users can view their own events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for emails
CREATE POLICY "Users can view their own emails" ON public.emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own emails" ON public.emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emails" ON public.emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emails" ON public.emails FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for job_roles
CREATE TRIGGER update_job_roles_updated_at
BEFORE UPDATE ON public.job_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();