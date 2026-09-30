-- =====================================================================
-- CCJP — Migration 0003 : données d'amorçage (seed)
--
-- Source : Cahier des Charges v1.0 §3 (14 commissions, indicateurs d'impact)
--          PLAN_IMPLEMENTATION.md §6.6
--
-- ⚠️ Ce seed contient les données officielles du CCJP. Les valeurs à
--    personnaliser par l'organisation (contacts, réseaux sociaux) sont
--    laissées vides — voir §18.3 du plan.
-- =====================================================================

-- =====================================================================
-- Les 14 commissions officielles
-- =====================================================================
insert into public.commissions
  (numero, slug, nom, description, vision, axes_strategiques, couleur, icone, ordre) values

(1, 'gouvernance-paix-securite',
 'Gouvernance, Paix & Sécurité',
 'Œuvre à la bonne gouvernance locale, à la prévention des conflits et à la sécurité des jeunes de Podor.',
 'Une jeunesse actrice de la paix et de la transparence dans la gestion des affaires locales.',
 array['Gouvernance & Engagement Citoyen'],
 '#1A3A5C', 'scale', 1),

(2, 'communication-relations-publiques',
 'Communication & Relations Publiques',
 'Porte la parole du CCJP, produit l''information institutionnelle et anime les plateformes numériques officielles.',
 'Faire du CCJP une institution visible, crédible et proche de la jeunesse podoroise.',
 array['Gouvernance & Engagement Citoyen'],
 '#1B5E20', 'megaphone', 2),

(3, 'emploi-entrepreneuriat',
 'Emploi & Entrepreneuriat',
 'Accompagne les jeunes vers l''emploi, l''auto-emploi et la création d''entreprise.',
 'Réduire le chômage des jeunes par l''employabilité et l''entrepreneuriat local.',
 array['Emploi, Entrepreneuriat & Numérique'],
 '#1A3A5C', 'briefcase', 3),

(4, 'education-formation',
 'Éducation & Formation',
 'Agit sur la réussite scolaire, l''orientation et l''accès à la formation pour tous les jeunes de Podor.',
 'Aucun jeune de Podor ne doit quitter le système éducatif faute d''accompagnement.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'graduation-cap', 4),

(5, 'numerique-innovation',
 'Numérique & Innovation',
 'Développe les compétences numériques des jeunes et favorise l''innovation technologique locale.',
 'Faire de la jeunesse de Podor un acteur de la transformation digitale.',
 array['Emploi, Entrepreneuriat & Numérique'],
 '#1A3A5C', 'laptop', 5),

(6, 'sante-bien-etre',
 'Santé & Bien-être',
 'Contribue à l''amélioration de la santé physique et mentale des jeunes et à la prévention.',
 'Une jeunesse en bonne santé, informée et responsable.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'heart-pulse', 6),

(7, 'genre-inclusion-equite',
 'Genre, Inclusion & Équité',
 'Œuvre à l''égalité des chances, à la participation des jeunes filles et à l''inclusion des personnes vulnérables.',
 'L''égalité de genre et l''inclusion comme conditions du développement de Podor.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'users', 7),

(8, 'environnement-developpement-durable',
 'Environnement & Développement Durable',
 'Porte les actions de protection de l''environnement, de reboisement et d''adaptation au changement climatique.',
 'Un Podor plus vert et résilient face aux défis climatiques.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'leaf', 8),

(9, 'diaspora-cooperation',
 'Diaspora & Coopération',
 'Mobilise la diaspora podoroise et structure les partenariats nationaux et internationaux.',
 'Une diaspora engagée comme levier de développement de Podor.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'globe', 9),

(10, 'citoyennete-vie-associative',
 'Citoyenneté & Vie Associative',
 'Renforce l''engagement citoyen des jeunes et soutient le tissu associatif de la commune.',
 'Une jeunesse engagée et un mouvement associatif dynamique.',
 array['Gouvernance & Engagement Citoyen'],
 '#1A3A5C', 'landmark', 10),

(11, 'sports',
 'Sports',
 'Développe la pratique sportive et organise les compétitions locales.',
 'Le sport comme vecteur de cohésion, de discipline et de dépassement.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'trophy', 11),

(12, 'culture',
 'Culture',
 'Valorise le patrimoine culturel podorois et accompagne la création artistique des jeunes.',
 'Une culture vivante, fierté et moteur d''attractivité pour Podor.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'palette', 12),

(13, 'diagnostic-suivi-evaluation',
 'Diagnostic, Suivi & Évaluation',
 'Produit les données sur la jeunesse et évalue la mise en œuvre du programme du CCJP.',
 'Une décision publique éclairée par des données fiables sur la jeunesse.',
 array['Pilotage, Patrimoine & Développement Territorial'],
 '#1A3A5C', 'bar-chart-3', 13),

(14, 'tourisme-patrimoine',
 'Tourisme & Patrimoine',
 'Fait connaître le patrimoine naturel, historique et culturel de Podor et promeut son attractivité.',
 'Faire de Podor une destination touristique portée par sa jeunesse.',
 array['Pilotage, Patrimoine & Développement Territorial'],
 '#1A3A5C', 'castle', 14);

-- =====================================================================
-- Les 8 indicateurs d'impact à horizon 2029 (CDC §3.3)
-- =====================================================================
insert into public.statistiques_indicateurs (libelle, valeur, unite, icone, ordre) values
('Élèves bénéficiaires des actions éducatives', '2 000', '+', 'school',    1),
('Jeunes formés aux compétences numériques',    '1 000', '+', 'laptop',    2),
('Arbres plantés pour un Podor plus vert',      '5 000', '+', 'trees',     3),
('Participants aux compétitions sportives',     '6 000', '+', 'trophy',    4),
('Projets entrepreneurs accompagnés',           '100',   '+', 'rocket',    5),
('Associations recensées',                       '300',   '+', 'building',  6),
('Partenariats nationaux et internationaux',    '20',    '+', 'handshake', 7),
('Commissions suivies et évaluées chaque année','14',    '',  'clipboard', 8);

-- =====================================================================
-- Paramètres du site (CDC §10.1)
-- Les valeurs vides sont à compléter par le CCJP — voir §18.3 du plan.
-- =====================================================================
insert into public.parametres (cle, valeur, description) values
('site_nom',         'CCJP — Conseil Consultatif des Jeunes de Podor', 'Nom du site affiché partout'),
('site_description', 'Plateforme officielle du Conseil Consultatif des Jeunes de Podor. Écoute · Participation · Impact.', 'Description pour le SEO'),
('email_contact',    'contact@ccjp-podor.sn',                          'Email de contact public — À CONFIRMER'),
('telephone',        '',                                               'Téléphone — À COMPLÉTER'),
('adresse',          'Podor, Région de Saint-Louis, Sénégal',          'Adresse postale'),
('facebook_url',     '',                                               'URL page Facebook — À COMPLÉTER'),
('instagram_url',    '',                                               'URL compte Instagram — À COMPLÉTER'),
('x_url',            '',                                               'URL compte X (Twitter) — À COMPLÉTER'),
('tiktok_url',       '',                                               'URL compte TikTok — À COMPLÉTER'),
('hero_titre',       'La voix de la jeunesse podoroise',               'Titre du bandeau d''accueil'),
('hero_sous_titre',  'Écoute · Participation · Impact',                'Sous-titre du bandeau d''accueil');
