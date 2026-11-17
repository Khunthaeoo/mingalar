-- ==============================================================================
-- MingalarMate Baseline Articles Seed (Phase 3)
-- Seed foundational articles into public.articles for all 6 categories
-- ==============================================================================

DO $$
DECLARE
    cat_edu INT;
    cat_visa INT;
    cat_jobs INT;
    cat_acc INT;
    cat_trans INT;
    cat_daily INT;
BEGIN
    SELECT id INTO cat_edu FROM public.categories WHERE slug = 'education';
    SELECT id INTO cat_visa FROM public.categories WHERE slug = 'visa-residence';
    SELECT id INTO cat_jobs FROM public.categories WHERE slug = 'part-time-jobs';
    SELECT id INTO cat_acc FROM public.categories WHERE slug = 'accommodation';
    SELECT id INTO cat_trans FROM public.categories WHERE slug = 'transportation';
    SELECT id INTO cat_daily FROM public.categories WHERE slug = 'daily-life';

    -- 1. Education Pathways
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_edu,
        'Higher Education Pathways & Admission Cycles in Taiwan',
        'higher-education-pathways-taiwan',
        'An overview of comprehensive universities vs universities of science and technology, fall and spring application cycles, and essential document authentication.',
        'Taiwan is recognized globally for academic excellence, state-of-the-art research laboratories, and safe campuses. Prospective international students can apply for comprehensive universities (such as NTU, NCKU, NTHU) or universities of science and technology (Taiwan Tech, Taipei Tech). The primary intake is the Fall Semester (applications open January to March/April), while Spring Semester applications typically run from August to October. Essential application documents include authenticated diplomas, official transcripts, language proficiency certificates (TOCFL or IELTS/TOEFL), study plans, and proof of financial resources.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 2. Scholarships
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_edu,
        'Taiwan Government & University Scholarships',
        'taiwan-scholarships-guide',
        'Detailed breakdown of the Taiwan MOE Scholarship, University Tuition Waivers, and TaiwanICDF awards for international degree seekers.',
        'International students in Taiwan have access to extensive financial support. The Ministry of Education (MOE) Taiwan Scholarship provides tuition discounts up to NT$40,000 per semester plus a monthly living allowance (NT$15,000 for undergraduates, NT$20,000 for graduate students). In addition, nearly all public and private universities offer direct institutional scholarships, full or partial tuition waivers, and campus teaching/research assistantships. Applications for government scholarships are typically submitted via local Taipei Economic and Cultural Offices (TECO) between February and March each year.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 3. ARC & Visa
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_visa,
        'Alien Resident Certificate (ARC) & Visa Procedures',
        'alien-resident-certificate-arc-guide',
        'Step-by-step guidance on applying for and extending your Alien Resident Certificate (ARC) through the National Immigration Agency.',
        'International students entering Taiwan on a Resident Visa must apply for an Alien Resident Certificate (ARC) at the National Immigration Agency (NIA) service center or via the online student application portal within the required statutory period after arrival. Required documents include your valid passport, student Resident Visa, proof of enrollment or university admission certificate, lease agreement or proof of campus dormitory assignment, and a recent 2-inch passport photo. The ARC serves as your official legal identification card while living in Taiwan and is required to open bank accounts and sign telecom contracts.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 4. Part-time Work Regulations
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_jobs,
        'Student Work Permit Rules & Ministry of Labor Regulations',
        'student-work-permits-and-regulations',
        'Statutory work permit requirements, 20-hour weekly limits during semesters, EZ Work Taiwan workflow, and illegal work penalties.',
        'Under the Employment Service Act, international students in Taiwan MUST obtain a formal Work Permit from the Workforce Development Agency (Ministry of Labor) before undertaking any paid work or internship. During regular academic semesters, international students are permitted to work a maximum of 20 hours per week. During official summer and winter recesses, this restriction is relaxed in accordance with current Ministry of Labor rules. Working without a valid permit is strictly prohibited under Article 43 and carries statutory fines between NT$30,000 and NT$150,000, permit revocation, and potential deportation. Applications are submitted online through the EZ Work Taiwan portal (ezwp.wda.gov.tw) with university endorsement.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 5. National Health Insurance
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_daily,
        'National Health Insurance (NHI) & Campus Healthcare',
        'national-health-insurance-nhi-guide',
        'Everything you need to know about Taiwan mandatory health insurance coverage, card issuance, clinics, and hospital visits.',
        'Taiwan is celebrated for its universal healthcare system. International students holding a valid Alien Resident Certificate (ARC) are legally required to enroll in the National Health Insurance (NHI) program after reaching 6 consecutive months of residence in Taiwan (or under designated university group schemes). The NHI card grants affordable access to Taiwan comprehensive network of western medicine clinics, traditional Chinese medicine clinics, dental practices, and major medical centers with minimal copayments. Prior to NHI eligibility, students are covered under group international student injury/medical insurance organized by their university.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 6. Accommodation
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_acc,
        'Student Housing: Campus Dormitories vs Private Rentals',
        'student-housing-and-rentals-taiwan',
        'Comparing dormitory life and private apartment rentals, lease contracts, utility bills, and 591 housing search tips.',
        'Finding suitable accommodation is a key milestone for incoming students. University dormitories offer affordable pricing, utilities and high-speed internet bundled into semester fees, and convenient campus proximity, but feature shared rooms (2 to 4 students) and quiet hours. Off-campus private rentals provide independence and private studios. When renting off-campus, expect standard lease agreements requiring 2 months of rental deposit, separate calculation of electric sub-meter fees (typically NT$5 to NT$6.5 per kWh in private rentals), and contracts in Traditional Chinese. International students are encouraged to seek assistance from their university Office of International Affairs or senior peer mentors when signing leases.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

    -- 7. Transportation
    INSERT INTO public.articles (category_id, title, slug, summary, content, language, is_published, last_reviewed)
    VALUES (
        cat_trans,
        'Public Transportation: EasyCard, MRT, Trains & YouBike',
        'public-transportation-taiwan-guide',
        'Navigating Taiwan integrated transit system using EasyCard smart cards, metro networks, high-speed rail, and public bicycles.',
        'Public transportation in Taiwan is punctual, clean, safe, and inexpensive. The EasyCard and iPass are rechargeable contactless IC cards accepted on city buses, MRT metro systems (Taipei, New Taipei, Taoyuan, Taichung, Kaohsiung), Taiwan Railways (TRA), and for YouBike public bicycle rentals. Many university student IDs double as discounted student EasyCards. For cross-island travel, Taiwan High Speed Rail (THSR) connects Taipei to Kaohsiung in under two hours with early bird student discounts, while the TRA train network offers scenic coastal routes circling the island.',
        'en',
        true,
        CURRENT_DATE
    ) ON CONFLICT DO NOTHING;

END $$;
