
-- ... (garder le début du fichier identique)

-- 2. TABLE DES ACTUALITÉS (NEWS)
-- ...
-- Politique : Insertion autorisée UNIQUEMENT pour l'admin authentifié
DROP POLICY IF EXISTS "Insertion admin news" ON public.news;
CREATE POLICY "Insertion admin news" 
ON public.news FOR INSERT 
TO authenticated 
WITH CHECK (auth.email() = 'jacquesmasuruku2@gmail.com');

-- 3. TABLE DES INSCRIPTIONS (REGISTRATIONS)
-- ...
-- Politique : Lecture restreinte (Seuls l'admin autorisé voit les données sensibles)
DROP POLICY IF EXISTS "Lecture restreinte inscriptions" ON public.registrations;
CREATE POLICY "Lecture restreinte inscriptions" 
ON public.registrations FOR SELECT 
TO authenticated 
USING (auth.email() = 'jacquesmasuruku2@gmail.com');

-- ... (garder la fin du fichier identique)
