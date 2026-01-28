-- ==============================================
-- OWLIST SEED DATA
-- Initial achievements for Phase 0
-- ==============================================

-- Quantity achievements
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('first_watch', 'Primera vista', 'Marca tu primer contenido como visto', 'quantity', 'bronze', false, '{"type": "total_watched", "count": 1}'),
('movie_buff_10', 'Cinéfilo novato', 'Ve 10 películas', 'quantity', 'bronze', false, '{"type": "movies_watched", "count": 10}'),
('movie_buff_50', 'Cinéfilo experto', 'Ve 50 películas', 'quantity', 'silver', false, '{"type": "movies_watched", "count": 50}'),
('movie_buff_100', 'Cinéfilo maestro', 'Ve 100 películas', 'quantity', 'gold', false, '{"type": "movies_watched", "count": 100}'),
('series_fan_10', 'Maratonista novato', 'Ve 10 series completas', 'quantity', 'bronze', false, '{"type": "series_watched", "count": 10}'),
('anime_fan_10', 'Otaku novato', 'Ve 10 animes', 'quantity', 'bronze', false, '{"type": "anime_watched", "count": 10}'),
('anime_fan_50', 'Otaku avanzado', 'Ve 50 animes', 'quantity', 'silver', false, '{"type": "anime_watched", "count": 50}'),
('anime_fan_100', 'Otaku legendario', 'Ve 100 animes', 'quantity', 'gold', false, '{"type": "anime_watched", "count": 100}');

-- Genre achievements
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('horror_explorer', 'Explorador del terror', 'Ve 10 películas de terror', 'genre', 'bronze', false, '{"type": "genre_watched", "genre": "Horror", "count": 10}'),
('romance_lover', 'Romántico empedernido', 'Ve 25 películas/series románticas', 'genre', 'silver', false, '{"type": "genre_watched", "genre": "Romance", "count": 25}'),
('comedy_fan', 'Rey de la risa', 'Ve 50 comedias', 'genre', 'gold', false, '{"type": "genre_watched", "genre": "Comedy", "count": 50}'),
('action_hero', 'Héroe de acción', 'Ve 30 películas de acción', 'genre', 'silver', false, '{"type": "genre_watched", "genre": "Action", "count": 30}');

-- Social achievements
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('first_review', 'Crítico novato', 'Escribe tu primera review', 'social', 'bronze', false, '{"type": "reviews_written", "count": 1}'),
('reviewer_10', 'Crítico experimentado', 'Escribe 10 reviews', 'social', 'silver', false, '{"type": "reviews_written", "count": 10}'),
('popular_review', 'Review popular', 'Recibe 10 likes en una review', 'social', 'silver', false, '{"type": "review_likes", "count": 10}'),
('influencer', 'Influencer', 'Consigue 50 seguidores', 'social', 'gold', false, '{"type": "followers", "count": 50}'),
('first_follow', 'Socializando', 'Sigue a tu primer usuario', 'social', 'bronze', false, '{"type": "following", "count": 1}');

-- Lists achievements
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('first_list', 'Organizador', 'Crea tu primera lista personalizada', 'lists', 'bronze', false, '{"type": "lists_created", "count": 1}'),
('curator', 'Curador', 'Crea 5 listas', 'lists', 'silver', false, '{"type": "lists_created", "count": 5}'),
('collaborator', 'Colaborador', 'Colabora en una lista de otro usuario', 'lists', 'bronze', false, '{"type": "list_collaborations", "count": 1}'),
('team_leader', 'Líder de equipo', 'Crea una lista con 5+ colaboradores', 'lists', 'gold', false, '{"type": "max_collaborators", "count": 5}');

-- Streak achievements
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('streak_7', 'Una semana activo', '7 días seguidos de actividad', 'streak', 'bronze', false, '{"type": "activity_streak", "days": 7}'),
('streak_30', 'Mes completo', '30 días seguidos de actividad', 'streak', 'silver', false, '{"type": "activity_streak", "days": 30}'),
('streak_100', 'Centenario', '100 días seguidos de actividad', 'streak', 'gold', false, '{"type": "activity_streak", "days": 100}');

-- Special achievements (hidden until unlocked)
INSERT INTO public.achievements (slug, name, description, category, tier, is_hidden, criteria) VALUES
('night_owl', 'Noctámbulo', 'Registra actividad entre 3am y 5am', 'special', 'silver', true, '{"type": "night_activity", "start_hour": 3, "end_hour": 5}'),
('marathon_5', 'Maratonista', 'Ve 5 películas en un solo día', 'special', 'gold', true, '{"type": "same_day_movies", "count": 5}'),
('binge_watcher', 'Binge watcher', 'Ve una temporada completa en un día', 'special', 'gold', true, '{"type": "season_in_day"}'),
('early_adopter', 'Pionero', 'Uno de los primeros 100 usuarios', 'special', 'platinum', true, '{"type": "user_number", "max": 100}');
