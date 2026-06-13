# Dreams — prototype

Plateforme de recueils de poèmes (prototype). Construit avec React + Vite + Tailwind + Supabase.

## Mettre ce projet sur GitHub

1. Décompresse ce dossier sur ton ordinateur.
2. Sur la page de ton repo GitHub, clique sur **"uploading an existing file"**.
3. Glisse-dépose **tous les fichiers et dossiers** décompressés (sauf `node_modules` et `dist`, qui ne doivent pas être envoyés) dans la zone d'upload.
4. Clique sur **"Commit changes"**.

## Déployer sur Vercel

1. Va sur vercel.com → "Add New Project".
2. Sélectionne ton repo `Isolde` (ou le nom que tu as choisi).
3. Vercel détecte automatiquement Vite/React, laisse les réglages par défaut.
4. Clique "Deploy". Ton site sera en ligne en 1-2 minutes.

## Prochaine étape : Supabase

Une fois Supabase configuré, on ajoutera un fichier `.env` avec :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
et on connectera les likes, commentaires et publications à une vraie base de données.
