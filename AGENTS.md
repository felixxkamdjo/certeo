# Instructions pour les Agents IA — Projet CERTEO

Ce fichier définit les règles, directives architecturales, conventions de code et commandes de référence pour tout agent IA intervenant sur le repository **CERTEO**.

---

## 📌 1. Contexte du Projet

- **Projet** : CERTEO (Écosystème de gestion du cycle de vie des talents pour Orange Digital Center).
- **Architecture Globale** : Monorepo combinant un Backend Modulaire (.NET 10 / ASP.NET Core) et un Frontend SPA (Angular 22+ Standalone).
- **Maquettes & PRD** : Répertoire `stitch_certeo_ux_design_plan/` contenant le PRD et les 43 prototypes d'écrans HTML/CSS.
- **Normes & Conventions** : Référence complète dans [`CODING_STANDARDS.md`](CODING_STANDARDS.md) (Casing, JSON camelCase, verbe+nom, ISO 8601 UTC).

```text
certeo/
├── backend/                  - Backend Application (.NET 10)
│   ├── src/
│   │   ├── Certeo.Gateway/   - Reverse Proxy YARP (Port 5000)
│   │   └── Certeo.Api/       - Modular Monolith (Port 5001)
├── frontend/                 - Frontend Application (Angular standalone + SCSS + pnpm)
├── stitch_certeo_ux_design_plan/ - Spécifications PRD & Maquettes UX Stitch
├── docker-compose.yml        - Orchestration Backend Dev
└── AGENTS.md                 - Ce fichier de directives
```

---

## 🎨 2. Charte Visuelle & Design System

- **Identité** : Orange Digital Center (ODC)
- **Couleur Principale** : Orange ODC (`#ff7900`)
- **Palette Neutre** : Noir (`#000000`), Blanc (`#ffffff`), Gris (`#212121` à `#fafafa`)
- **Typographie** : *Hanken Grotesk* (Google Fonts)
- **Tokens SCSS** : Toujours utiliser les variables de `styles/variables` et mixins de `styles/mixins`.

---

## 💻 3. Directives Frontend (Angular)

### Architecture & Organisation des Dossiers (`frontend/src/app/`)
- **`core/` (`@core`)** : Singletons globaux (ne jamais importer de code métier `features/` ici).
  - `services/api.service.ts` : Wrapper `HttpClient`.
  - `services/auth.service.ts` : Authentification et gestion de session via Signals.
  - `interceptors/` : `auth.interceptor.ts` (JWT), `error.interceptor.ts`.
  - `guards/` : `auth.guard.ts`, `role.guard.ts`.
- **`shared/` (`@shared`)** : UI réutilisable transverse (Sidebar, Header, DataTable, StatusBadge, ConfirmDialog, Stepper, EmptyState, Pipes, Validators).
- **`layouts/` (`@layouts/*`)** :
  - `admin-layout` : Back-office avec Sidebar + Header.
  - `public-layout` : Formulaires publics visiteurs, candidatures et quiz.
  - `auth-layout` : Écran de connexion.
- **`features/` (`@features/*`)** : 10 modules métier isolés :
  - `auth/`, `dashboard/`, `trainings/`, `applications/`, `presence/`, `evaluations/`, `certificates/`, `participants/`, `reporting/`, `settings/`.
  - Chaque module contient : `pages/`, `services/`, `models/`, `*.routes.ts` et `README.md`.

### Règles de Développement Frontend
1. **Composants Standalone** : Toujours déclarer `standalone: true` et importer les dépendances explicitement via `imports: [...]`. Pas de `NgModule`.
2. **State Management** : Utiliser les **Angular Signals** (`signal()`, `computed()`, `.asReadonly()`) dans les services et composants.
3. **Styles** : Utiliser SCSS. Toujours inclure `@use 'styles/variables' as *;` et `@use 'styles/mixins' as *;`.
4. **Path Aliases** : Utiliser `@core`, `@shared`, `@features/*`, `@layouts/*`, `@env/*`.
5. **Routage** : Toutes les routes de modules doivent être lazy-loadées via `loadComponent` ou `loadChildren`.

---

## ⚙️ 4. Directives Backend (.NET)

- **Passerelle** : `Certeo.Gateway` reçoit toutes les requêtes frontales sur le port `5000` et les redirige vers `Certeo.Api` (port `5001`).
- **Modèles de domaine** : Suivre une séparation modulaire claire par domaine métier (Identity, Trainings, Applications, Presence, Evaluations, Certificates, Reporting).
- **Validation** : FluentValidation ou DataAnnotations avec réponses d'erreur standardisées.

---

## 🛠️ 5. Commandes & Workflow

### Frontend
```bash
cd frontend
pnpm install       # Installer les dépendances
pnpm start         # Démarrer le serveur dev (http://localhost:4200)
pnpm run build     # Valider la compilation
pnpm run test      # Lancer les tests unitaires
```

### Backend
```bash
# Lancement Docker (Gateway + API)
docker compose up --build

# Ou lancement local .NET
cd backend
dotnet restore
dotnet build
```

### Git Conventions
- **Branche principale d'intégration** : `develop`
- **Branches de fonctionnalités** : `feature/<nom-du-module>` (ex: `feature/trainings-form`)
- **Format des commits** : `feat(scope): description`, `fix(scope): description`, `refactor(scope): description`

---

## ⚠️ 6. Contraintes & Règles Strictes pour les Agents

1. **Ne pas casser la modularité** : Ne jamais introduire de couplage fort entre deux modules dans `features/`. Passer par `core/` ou `shared/` si un élément doit être partagé.
2. **Respect des maquettes** : Toujours vérifier le dossier de maquette correspondant dans `stitch_certeo_ux_design_plan/` avant d'implémenter une page ou un flux utilisateur.
3. **Zéro Emoji dans le Code** : Ne JAMAIS utiliser d'emojis dans le code source (templates HTML, composants TypeScript, chaînes de caractères d'UI, SCSS, modèles ou commentaires). Utiliser exclusivement des icônes SVG intégrées ou du texte épuré et professionnel.
4. **Validation de Build** : Après toute modification frontend substantielle, TOUJOURS exécuter `pnpm run build` dans le dossier `frontend` pour garantir qu'aucune régression de type ou de style n'a été introduite.
