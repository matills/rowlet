ALTER TABLE public.media
ADD COLUMN original_language TEXT,
ADD COLUMN origin_country TEXT[];

CREATE INDEX idx_media_original_language ON public.media(original_language);
CREATE INDEX idx_media_origin_country ON public.media USING GIN(origin_country);
