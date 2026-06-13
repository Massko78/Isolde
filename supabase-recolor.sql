-- Optionnel : harmonise les couleurs des 4 recueils de départ
-- avec la nouvelle palette "ciel". À exécuter dans SQL Editor > Run.

update collections set seal_color = '#6FA3D8' where id = 1;
update collections set seal_color = '#9FC1E8' where id = 2;
update collections set seal_color = '#7B93B5' where id = 3;
update collections set seal_color = '#6FA3D8' where id = 4;
