-- ============================================
-- Bibliothèque de poèmes classiques
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

create table if not exists classic_poems (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  birth_year int,
  death_year int,
  nationality text,
  content text not null,
  themes text[] default '{}',
  period text,          -- ex: "Romantisme", "Symbolisme", "Renaissance"
  created_at timestamptz default now()
);

alter table classic_poems enable row level security;
create policy "lecture publique classiques" on classic_poems for select using (true);
create policy "ajout classiques moderateur" on classic_poems for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);
create policy "maj classiques moderateur" on classic_poems for update using (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

-- Commentaires sur les classiques (table séparée)
create table if not exists classic_comments (
  id bigint generated always as identity primary key,
  poem_id bigint references classic_poems(id) on delete cascade,
  author text,
  author_id uuid references auth.users(id),
  anonymous boolean not null default false,
  content text not null,
  created_at timestamptz default now()
);

alter table classic_comments enable row level security;
create policy "lecture publique classic comments" on classic_comments for select using (true);
create policy "ajout classic comments" on classic_comments for insert with check (true);
create policy "suppression classic comments moderateur" on classic_comments for delete using (
  author_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

-- Seed : une sélection de grands poèmes (domaine public)
insert into classic_poems (title, author, birth_year, death_year, nationality, period, themes, content) values

('Demain dès l''aube', 'Victor Hugo', 1802, 1885, 'Française', 'Romantisme',
 ARRAY['deuil', 'amour', 'nature', 'mort'],
 E'Demain, dès l''aube, à l''heure où blanchit la campagne,\nJe partirai. Vois-tu, je sais que tu m''attends.\nJ''irai par la forêt, j''irai par la montagne.\nJe ne puis demeurer loin de toi plus longtemps.\n\nJe marcherai les yeux fixés sur mes pensées,\nSans rien voir au dehors, sans entendre aucun bruit,\nSeul, inconnu, le dos courbé, les mains croisées,\nTriste, et le jour pour moi sera comme la nuit.\n\nJe ne regarderai ni l''or du soir qui tombe,\nNi les voiles au loin descendant vers Harfleur,\nEt quand j''arriverai, je mettrai sur ta tombe\nUn bouquet de houx vert et de bruyère en fleur.'),

('Correspondances', 'Charles Baudelaire', 1821, 1867, 'Française', 'Symbolisme',
 ARRAY['nature', 'synesthésie', 'mystère', 'beauté'],
 E'La Nature est un temple où de vivants piliers\nLaissent parfois sortir de confuses paroles ;\nL''Homme y passe à travers des forêts de symboles\nQui l''observent avec des regards familiers.\n\nComme de longs échos qui de loin se confondent\nDans une ténébreuse et profonde unité,\nVaste comme la nuit et comme la clarté,\nLes parfums, les couleurs et les sons se répondent.\n\nIl est des parfums frais comme des chairs d''enfants,\nDoux comme les hautbois, verts comme les prairies,\n— Et d''autres, corrompus, riches et triomphants,\n\nAyant l''expansion des choses infinies,\nComme l''ambre, le musc, le benjoin et l''encens,\nQui chantent les transports de l''esprit et des sens.'),

('L''Albatros', 'Charles Baudelaire', 1821, 1867, 'Française', 'Symbolisme',
 ARRAY['poète', 'liberté', 'exil', 'beauté'],
 E'Souvent, pour s''amuser, les hommes d''équipage\nPrennent des albatros, vastes oiseaux des mers,\nQui suivent, indolents compagnons de voyage,\nLe navire glissant sur les gouffres amers.\n\nÀ peine les ont-ils déposés sur les planches,\nQue ces rois de l''azur, maladroits et honteux,\nLaissent piteusement leurs grandes ailes blanches\nComme des avirons traîner à côté d''eux.\n\nCe voyageur ailé, comme il est gauche et veule !\nLui, naguère si beau, qu''il est comique et laid !\nL''un agace son bec avec un brûle-gueule,\nL''autre mime, en boitant, l''infirme qui volait !\n\nLe Poète est semblable au prince des nuées\nQui hante la tempête et se rit de l''archer ;\nExilé sur le sol au milieu des huées,\nSes ailes de géant l''empêchent de marcher.'),

('Le Dormeur du val', 'Arthur Rimbaud', 1854, 1891, 'Française', 'Symbolisme',
 ARRAY['guerre', 'mort', 'nature', 'jeunesse'],
 E'C''est un trou de verdure où chante une rivière\nAccrochant follement aux herbes des haillons\nD''argent ; où le soleil, de la montagne fière,\nLuit : c''est un petit val qui mousse de rayons.\n\nUn soldat jeune, bouche ouverte, tête nue,\nEt la nuque baignant dans le frais cresson bleu,\nDort ; il est étendu dans l''herbe, sous la nue,\nPâle dans son lit vert où la lumière pleut.\n\nLes pieds dans les glaïeuls, il dort. Souriant comme\nSourirait un enfant malade, il fait un somme :\nNature, berce-le chaudement : il a froid.\n\nLes parfums ne font pas frissonner sa narine ;\nIl dort dans le soleil, la main sur sa poitrine,\nTransquille. Il a deux trous rouges au côté droit.'),

('Sensation', 'Arthur Rimbaud', 1854, 1891, 'Française', 'Symbolisme',
 ARRAY['liberté', 'nature', 'amour', 'errance'],
 E'Par les soirs bleus d''été, j''irai dans les sentiers,\nPicoté par les blés, fouler l''herbe menue :\nRêveur, j''en sentirai la fraîcheur à mes pieds.\nJe laisserai le vent baigner ma tête nue.\n\nJe ne parlerai pas, je ne penserai rien :\nMais l''amour infini me montera dans l''âme,\nEt j''irai loin, bien loin, comme un bohémien,\nPar la Nature, — heureux comme avec une femme.'),

('Chanson d''automne', 'Paul Verlaine', 1844, 1896, 'Française', 'Symbolisme',
 ARRAY['mélancolie', 'automne', 'tristesse', 'temps'],
 E'Les sanglots longs\nDes violons\nDe l''automne\nBlessent mon cœur\nD''une langueur\nMonotone.\n\nTout suffocant\nEt blême, quand\nSonne l''heure,\nJe me souviens\nDes jours anciens\nEt je pleure ;\n\nEt je m''en vais\nAu vent mauvais\nQui m''emporte\nDeçà, delà,\nPareil à la\nFeuille morte.'),

('Il pleure dans mon cœur', 'Paul Verlaine', 1844, 1896, 'Française', 'Symbolisme',
 ARRAY['tristesse', 'pluie', 'mélancolie', 'amour'],
 E'Il pleure dans mon cœur\nComme il pleut sur la ville ;\nQuelle est cette langueur\nQui pénètre mon cœur ?\n\nÔ bruit doux de la pluie\nPar terre et sur les toits !\nPour un cœur qui s''ennuie\nÔ le chant de la pluie !\n\nIl pleure sans raison\nDans ce cœur qui s''écœure.\nQuoi ! nulle trahison ?...\nCe deuil est sans raison.\n\nC''est bien la pire peine\nDe ne savoir pourquoi\nSans amour et sans haine\nMon cœur a tant de peine !'),

('Le Pont Mirabeau', 'Guillaume Apollinaire', 1880, 1918, 'Française', 'Modernisme',
 ARRAY['amour', 'temps', 'perte', 'mémoire'],
 E'Sous le pont Mirabeau coule la Seine\nEt nos amours\nFaut-il qu''il m''en souvienne\nLa joie venait toujours après la peine\n\nVienne la nuit sonne l''heure\nLes jours s''en vont je demeure\n\nLes mains dans les mains restons face à face\nTandis que sous\nLe pont de nos bras passe\nDes éternels regards l''onde si lasse\n\nVienne la nuit sonne l''heure\nLes jours s''en vont je demeure\n\nL''amour s''en va comme cette eau courante\nL''amour s''en va\nComme la vie est lente\nEt comme l''Espérance est violente\n\nVienne la nuit sonne l''heure\nLes jours s''en vont je demeure\n\nPassent les jours et passent les semaines\nNi temps passé\nNi les amours reviennent\nSous le pont Mirabeau coule la Seine\n\nVienne la nuit sonne l''heure\nLes jours s''en vont je demeure'),

('Spleen', 'Charles Baudelaire', 1821, 1867, 'Française', 'Symbolisme',
 ARRAY['ennui', 'dépression', 'temps', 'enfermement'],
 E'Quand le ciel bas et lourd pèse comme un couvercle\nSur l''esprit gémissant en proie aux longs ennuis,\nEt que de l''horizon embrassant tout le cercle\nIl nous verse un jour noir plus triste que les nuits ;\n\nQuand la terre est changée en un cachot humide,\nOù l''Espérance, comme une chauve-souris,\nS''en va battant les murs de son aile timide\nEt se cognant la tête à des plafonds pourris ;\n\nQuand la pluie étalant ses immenses traînées\nD''une vaste prison imite les barreaux,\nEt qu''un peuple muet d''infâmes araignées\nVient tendre ses filets au fond de nos cerveaux,\n\nDes cloches tout à coup sautent avec furie\nEt lancent vers le ciel un affreux hurlement,\nAinsi que des esprits errants et sans patrie\nQui se mettent à geindre opiniâtrement.\n\n— Et de longs corbillards, sans tambours ni musique,\nDéfilent lentement dans mon âme ; l''Espoir,\nVaincu, pleure, et l''Angoisse atroce, despotique,\nSur mon crâne incliné plante son drapeau noir.'),

('La Nuit de Mai', 'Alfred de Musset', 1810, 1857, 'Française', 'Romantisme',
 ARRAY['inspiration', 'poésie', 'amour', 'nature'],
 E'Poète, prends ton luth et me donne un baiser ;\nLa fleur de l''églantier sent ses bourgeons éclore.\nLe printemps naît ce soir ; les vents vont s''embraser ;\nEt la bergeronnette, en attendant l''aurore,\nAux premiers buissons verts commence à se poser.\n\nPoète, prends ton luth, et me donne un baiser.'),

('Heureux qui, comme Ulysse', 'Joachim du Bellay', 1522, 1560, 'Française', 'Renaissance',
 ARRAY['voyage', 'nostalgie', 'patrie', 'retour'],
 E'Heureux qui, comme Ulysse, a fait un beau voyage,\nOu comme cestuy-là qui conquit la toison,\nEt puis est retourné, plein d''usage et raison,\nVivre entre ses parents le reste de son âge !\n\nQuand reverrai-je, hélas, de mon petit village\nFumer la cheminée, et en quelle saison\nReverrai-je le clos de ma pauvre maison,\nQui m''est une province, et beaucoup davantage ?\n\nPlus me plaît le séjour qu''ont bâti mes aïeux,\nQue des palais Romains le front audacieux,\nPlus que le marbre dur me plaît l''ardoise fine :\n\nPlus mon Loire gaulois, que le Tibre latin,\nPlus mon petit Liré, que le mont Palatin,\nEt plus que l''air marin la douceur angevine.'),

('Si tu t''imagines', 'Raymond Queneau', 1903, 1976, 'Française', 'Modernisme',
 ARRAY['jeunesse', 'temps', 'beauté', 'ironie'],
 E'Si tu t''imagines\nsi tu t''imagines\nfillette fillette\nsi tu t''imagines\nxa va xa va xa\nque ça va durer\ntoujours\nla saison des za\nla saison des za\nzamours ce sera\ntoujours toujours\ntu te fais fillette\ntu te fais des illusions\n\nl''ombre de la retraite\nte convie aux moissons\nle temps s''en va\nle temps s''en va\ntoi aussi tu partiras'),

('Barbara', 'Jacques Prévert', 1900, 1977, 'Française', 'Modernisme',
 ARRAY['guerre', 'amour', 'pluie', 'mémoire'],
 E'Rappelle-toi Barbara\nIl pleuvait sans cesse sur Brest ce jour-là\nEt tu marchais souriante\nÉpanouie ravie ruisselante\nSous la pluie\n\nRappelle-toi Barbara\nIl pleuvait sans cesse sur Brest\nEt je t''ai croisée rue de Siam\nTu souriais\nEt moi je souriais de même\n\nRappelle-toi Barbara\nToi que je ne connaissais pas\nToi qui ne me connaissais pas\nRappelle-toi\nRappelle-toi quand même ce jour-là\nN''oublie pas\n\nUn homme sous un porche s''abritait\nEt il a crié ton nom\nBarbara\nEt tu as couru vers lui sous la pluie\nRuisselante ravie épanouie\nEt tu t''es jetée dans ses bras\n\nRappelle-toi cela Barbara\nEt ne m''en veux pas si je te tutoie\nJe dis tu à tous ceux que j''aime\nMême si je ne les ai vus qu''une seule fois'),

('Le cancre', 'Jacques Prévert', 1900, 1977, 'Française', 'Modernisme',
 ARRAY['liberté', 'enfance', 'rébellion', 'amour'],
 E'Il dit non avec la tête\nmais il dit oui avec le cœur\nil dit oui à ce qu''il aime\nil dit non au professeur\nil est debout\non le questionne\net tous les problèmes sont posés\nsoudain le fou rire le prend\net il efface tout\nles chiffres et les mots\nles dates et les noms\nles phrases et les pièges\net malgré les menaces du maître\nsous les huées des enfants prodiges\navec des craies de toutes les couleurs\nsur le tableau noir du malheur\nil dessine le visage du bonheur.');
