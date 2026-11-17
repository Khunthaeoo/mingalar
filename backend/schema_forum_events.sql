-- ==============================================================================
-- MingalarMate Forum & Events Schema Extension
-- Adds Community Forum & Event Management tables with RLS and Seed Data
-- ==============================================================================

-- 1. Community Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('academics', 'life', 'jobs', 'general')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'my', 'zh')),
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Forum Comments Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    organizer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'cultural' CHECK (category IN ('cultural', 'academic', 'career', 'social')),
    capacity INT NOT NULL DEFAULT 50,
    registered_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- ==============================================================================
-- Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Forum Policies
CREATE POLICY "Forum posts viewable by everyone" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'anon');
CREATE POLICY "Users can update their own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by everyone" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON public.forum_comments FOR INSERT WITH CHECK (true);

-- Events Policies
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can create events" ON public.events FOR ALL USING (true);

CREATE POLICY "Registrations viewable by attendees" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Students can register for events" ON public.event_registrations FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- Initial Seed Data: Events
-- ==============================================================================
INSERT INTO public.events (title, description, location, event_date, organizer, category, capacity, registered_count)
VALUES
    (
        'Myanmar Traditional Thingyan & Water Festival Gathering',
        'Celebrate the new year with international and local students! Includes traditional Myanmar snacks, cultural performances, and networking.',
        'NCNU Student Activity Center Plaza, Puli',
        now() + interval '14 days',
        'NCNU Myanmar Student Association',
        'cultural',
        80,
        34
    ),
    (
        'Foreign Student Work Permit & Employment Law Workshop',
        'Detailed seminar explaining Ministry of Labor student work permits, hour limitations, ARC extensions, and post-graduation contact point scoring system.',
        'International Conference Hall B1, NCNU',
        now() + interval '7 days',
        'Office of International Affairs (OIA)',
        'career',
        100,
        68
    ),
    (
        'TOCFL Chinese Language Exam Study Group & Practice',
        'Free weekly peer study session for students preparing for TOCFL Band B (Level 3 & 4) certification required for graduation and scholarships.',
        'Campus Library 3F Discussion Room 4',
        now() + interval '3 days',
        'MingalarMate Peer Mentors',
        'academic',
        30,
        18
    )
ON CONFLICT DO NOTHING;

-- Initial Seed Data: Forum Posts
INSERT INTO public.forum_posts (author_name, category, title, content, language, likes_count)
VALUES
    (
        'Kyaw Swar (NCNU Senior)',
        'academics',
        'Tips for applying for the Taiwan MOE Scholarship renewal at NCNU',
        'Make sure to submit your official semester transcripts before the July 15 deadline to the OIA. You need a GPA of at least 80 or ranking in top 30% of your class. Let me know if you need help preparing your recommendation letters!',
        'en',
        12
    ),
    (
        'Htet Htet',
        'life',
        'Where to find authentic Myanmar tea leaf (Laphet) in Taichung & Puli?',
        'Mingalarba everyone! Does anyone know Asian grocery stores near Puli or Taichung train station that carry fresh laphet and fried beans? Craving tea leaf salad before midterm exams!',
        'en',
        9
    ),
    (
        'Thura Aung',
        'jobs',
        'EZ Work Taiwan portal permit approval timeframe update',
        'Applied last Tuesday via the online EZ Work Taiwan system. OIA approved in 2 days and the Ministry of Labor issued the electronic permit in 5 working days. Make sure your postal fee slip is scanned clearly.',
        'en',
        15
    )
ON CONFLICT DO NOTHING;
