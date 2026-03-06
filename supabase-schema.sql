-- AI OCR SaaS - Supabase Database Schema
-- Run this completely in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Patient Folders Table
-- This represents the "User Folders" for patients like John Doe.
CREATE TABLE public.patient_folders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  patient_name text not null,
  created_by uuid references auth.users not null
);

-- 2. Create Documents Table
-- This stores the individual scans (billing, MRI, doctor notes) that belong to a folder.
CREATE TABLE public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  folder_id uuid references public.patient_folders on delete cascade not null,
  file_name text not null,
  file_url text,
  document_type text, -- 'billing', 'doctor_notes', 'mri', etc.
  extracted_data jsonb, -- The structured JSON from the OCR worker
  status text default 'pending' -- 'pending', 'processing', 'completed', 'failed'
);

-- 3. Set Up Row Level Security (RLS)
-- This ensures that only authenticated employees can see the documents they created.
ALTER TABLE public.patient_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Patient Folders
CREATE POLICY "Enable ALL actions for authenticated users" ON public.patient_folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 5. Create Policies for Documents
-- A document can be accessed if the user owns the folder it belongs to.
CREATE POLICY "Enable ALL actions for authenticated users via folders" ON public.documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_folders
      WHERE patient_folders.id = documents.folder_id
      AND patient_folders.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_folders
      WHERE patient_folders.id = documents.folder_id
      AND patient_folders.created_by = auth.uid()
    )
  );

-- 6. Setup Storage Bucket for PDFs and Images
insert into storage.buckets (id, name, public) 
values ('scans', 'scans', false);

-- 7. Storage RLS Policies
-- Only authenticated users can upload and read their files
create policy "Authenticated users can upload scans"
on storage.objects for insert to authenticated with check ( bucket_id = 'scans' );

create policy "Authenticated users can view scans"
on storage.objects for select to authenticated using ( bucket_id = 'scans' );

-- 8. Create API Keys Table for Developer Access
CREATE TABLE public.api_keys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  key_name text not null,
  key_value text not null unique,
  last_used_at timestamp with time zone
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all actions for authenticated users via api keys" ON public.api_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
