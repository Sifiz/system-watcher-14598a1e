

# Plan : Terminal plein écran, File Browser, et Process Manager filtré

## Résumé des changements

3 modifications principales :
1. **Terminal plein écran** sur une route dédiée `/machines/:machineId/terminal` — connexion live avec la machine via l'API `executeCommand`
2. **Renommer "Config" en "File Browser"** — uniquement le libellé, la page reste fonctionnelle
3. **Process Manager** — ne plus afficher un top 10 de tous les processus mais uniquement les processus épinglés (pinned) que l'utilisateur choisit de surveiller/lancer

---

## Détails techniques

### 1. Page Terminal plein écran (`/machines/:machineId/terminal`)

- **Nouvelle page** `src/pages/Terminal.tsx` : layout plein écran avec header minimal (nom machine, bouton retour), zone de sortie terminal scrollable, et input de commande en bas
- Récupère `machineId` depuis les params de route, charge les infos machine via l'API
- Exécution des commandes via `api.executeCommand(machineId, command)` — résultats live depuis le backend (plus de simulation locale)
- Historique des commandes navigable (flèches haut/bas), bouton clear
- **Route** ajoutée dans `App.tsx` : `/machines/:machineId/terminal`
- **Lien d'accès** : bouton Terminal sur chaque `MachineCard` (icône Terminal) qui navigue vers `/machines/{id}/terminal`
- Supprimer l'onglet Terminal du `ProcessManager` sidebar (il est remplacé par la page dédiée)

### 2. Renommer "Config" → "File Browser"

- `DashboardHeader.tsx` : changer le label du bouton de "Config" à "File Browser"
- `Config.tsx` (header) : changer le titre de "Config Files" à "File Browser"
- La description passe de "Gestion des fichiers de configuration des processus" à "Parcourir les fichiers de configuration"

### 3. Process Manager — uniquement les processus choisis

- Modifier `ProcessManager` pour ne plus afficher tous les processus retournés par l'API
- Afficher uniquement les processus correspondant aux `pinnedProcesses` de la machine sélectionnée
- Ajouter un bouton "+" pour ajouter un processus à surveiller (input nom du process) — appel API `POST /machines/:id/pinned-processes`
- Ajouter un bouton supprimer pour retirer un process de la liste des épinglés
- Nouvel endpoint API dans `api.ts` : `addPinnedProcess` et `removePinnedProcess`
- Le filtrage se fait côté frontend : on matche `processes.filter(p => pinnedNames.includes(p.name))`
- Possibilité de lancer un process épinglé qui est "stopped" via le bouton Play existant

### Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| `src/pages/Terminal.tsx` | Créer — page terminal plein écran |
| `src/App.tsx` | Modifier — ajouter route `/machines/:machineId/terminal` |
| `src/components/MachineCard.tsx` | Modifier — ajouter lien Terminal |
| `src/components/ProcessManager.tsx` | Modifier — supprimer onglet terminal, filtrer sur pinned processes, ajouter gestion des épinglés |
| `src/components/DashboardHeader.tsx` | Modifier — renommer Config → File Browser |
| `src/pages/Config.tsx` | Modifier — renommer titre |
| `src/lib/api.ts` | Modifier — ajouter endpoints pinned processes |
| `src/hooks/useMonitoringData.ts` | Modifier — exposer la gestion des pinned processes |

