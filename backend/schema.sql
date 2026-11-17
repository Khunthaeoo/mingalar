-- ==============================================================================
-- MingalarMate Database Schema
-- Supabase PostgreSQL Migration Script (Phase 2)
-- Compatible with pgvector, Supabase Auth, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================================================
-- 2. Profiles Table (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'my', 'zh')),
    university TEXT DEFAULT 'National Chi Nan University (NCNU)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. Information Categories Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_zh TEXT,
    name_my TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert baseline categories from project proposal
INSERT INTO public.categories (name, name_zh, name_my, slug, icon, sort_order)
VALUES
    ('Education & University', '教育及學校資訊', 'ပညာရေးနှင့် တက္ကသိုလ်အချက်အလက်', 'education', 'graduation-cap', 1),
    ('Visa & Residence', '簽證及居留資訊', 'ဗီဇာနှင့် နေထိုင်ခွင့်အချက်အလက်', 'visa-residence', 'passport', 2),
    ('Part-time Jobs', '打工及法規資訊', 'အချိန်ပိုင်းအလုပ်နှင့် ဥပဒေစည်းမျဉ်းများ', 'part-time-jobs', 'briefcase', 3),
    ('Accommodation', '租屋與宿舍資訊', 'အဆောင်နှင့် တိုက်ခန်းငှားရမ်းခြင်း', 'accommodation', 'home', 4),
    ('Transportation', '大眾交通資訊', 'အများပြည်သူသယ်ယူပို့ဆောင်ရေး', 'transportation', 'subway', 5),
    ('Daily Life & Health', '日常生活與健保', 'နေ့စဉ်လူနေမှုဘဝနှင့် ကျန်းမာရေးစောင့်ရှောက်မှု', 'daily-life', 'heart-pulse', 6)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 4. Articles Table (Information Center)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'my', 'zh')),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_reviewed DATE DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_language ON public.articles(language);

-- ==============================================================================
-- 5. PDF Documents & Vector Knowledge Base (RAG Preparation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Text chunks with vector embeddings (dimension 768 for EmbeddingGemma / Google text-embedding-004)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON public.document_chunks(document_id);

-- ==============================================================================
-- 6. AI Chat Sessions & Messages Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'my', 'zh')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

-- ==============================================================================
-- 7. User Feedback Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
    ON public.articles FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage all articles"
    ON public.articles FOR ALL
    USING (public.is_admin());

-- Documents and Chunks policies
CREATE POLICY "Documents viewable by authenticated users"
    ON public.documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert and manage documents"
    ON public.documents FOR ALL
    USING (public.is_admin());

CREATE POLICY "Document chunks readable for vector search"
    ON public.document_chunks FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage document chunks"
    ON public.document_chunks FOR ALL
    USING (public.is_admin());

-- Chat Sessions policies
CREATE POLICY "Users can access their own chat sessions"
    ON public.chat_sessions FOR ALL
    USING (auth.uid() = user_id);

-- Chat Messages policies
CREATE POLICY "Users can view and add messages to their own sessions"
    ON public.chat_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = chat_messages.session_id AND user_id = auth.uid()
        )
    );

-- Feedback policies
CREATE POLICY "Users can create feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback, admins view all"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 9. Automatic Profile Creation Trigger on Signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, preferred_language, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. Vector Similarity Match Function (for RAG in Phase 4)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding vector(768),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_index INT,
    content TEXT,
    similarity float,
    metadata JSONB
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity,
        dc.metadata
    FROM public.document_chunks dc
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
