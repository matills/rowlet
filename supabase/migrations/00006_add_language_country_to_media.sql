-- Add language and country fields to media table
-- Sprint 13 - Achievement System Enhancement

-- Add original_language column (ISO 639-1 code, e.g., 'en', 'ja', 'es')
ALTER TABLE public.media
ADD COLUMN original_language TEXT;

-- Add origin_country column (array of ISO 3166-1 codes, e.g., ['US'], ['JP'])
ALTER TABLE public.media
ADD COLUMN origin_country TEXT[];

-- Create index for language-based queries
CREATE INDEX idx_media_original_language ON public.media(original_language);

-- Create GIN index for country-based queries (for array containment)
CREATE INDEX idx_media_origin_country ON public.media USING GIN(origin_country);

-- Add comment for documentation
COMMENT ON COLUMN public.media.original_language IS 'ISO 639-1 language code (e.g., en, ja, es, fr)';
COMMENT ON COLUMN public.media.origin_country IS 'Array of ISO 3166-1 country codes (e.g., [US], [JP, US])';
