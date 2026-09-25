# Trainings - Guide d'intégration Frontend & Backend

| | |
|---|---|
| **Statut** | En dev - 4 points bloquants identifiés en §7 (auth) et §7#1 (catégories) à trancher côté back avant intégration front complète |
| **Dernière mise à jour** | 2026-08-21 |
| **Branche** | `feature/training-module` |
| **Responsable** | - |

> Ce document décrit comment le frontend Angular doit se connecter à l'API .NET (Certeo.Api), en se concentrant sur le module **Trainings** livré sur la branche `feature/training-module`. Il complète - sans le remplacer - le contrat strict généré par Swagger (`/swagger`).

---

## 1. Environnements & URLs de base

| Environnement | Mode de lancement | Base URL API | Notes |
| --- | --- | --- | --- |
| Dev local (actuel) | `dotnet run` depuis `Certeo.Api` | `http://localhost:5239` | Port réel observé au lancement (`Now listening on...`), variable selon la machine - **à ne pas coder en dur côté front**, utiliser `environment.ts`. |
| Dev conteneurisé (à venir) | `docker compose up` | Gateway : `http://localhost:5000` / API directe : `http://localhost:5001` | Définis dans `docker-compose.yml` (`gateway` → 5000, `api` → 5001). Pas encore utilisé en pratique - le développement se fait actuellement en `dotnet run`. |
| Production | À définir | - | Sera fixé au moment du déploiement (cf. §9). |

Swagger UI (dev uniquement, activé dans `Program.cs` via `IsDevelopment()`) : `http://localhost:5239/swagger` - c'est la **source de vérité** pour les schémas exacts de requête/réponse.

**CORS** : la policy actuelle est `AllowAll` (`AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()`), donc aucun blocage CORS en dev quel que soit le port du front.  Cette policy est trop permissive pour la prod - à restreindre à l'origine réelle du front avant mise en ligne.

---

## 2. Authentification (JWT)

### 2.1 Login

| | |
| --- | --- |
| Endpoint | `POST /api/auth/login` |
| Auth requise | Non |
| Content-Type | `application/json` |

**Requête :**
```json
{
  "email": "admin@certeo.local",
  "password": "ChangeMe123!"
}
```

**Réponse 200** - DTO complet `LoginResponse` (confirmé par `AuthDtos.cs`) :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64-64-bytes-aleatoires",
  "accessTokenExpiresAt": "2026-08-20T11:15:00Z",
  "userFullName": "Admin Certeo",
  "userEmail": "admin@certeo.local",
  "role": "SUPER_ADMIN"
}
```
- `role` : string simple (`user.Role.Name.ToString()` fait explicitement dans `AuthService`, indépendamment de la config JSON globale) - pas d'ambiguïté de sérialisation à craindre ici, contrairement aux enums `Training*` (voir §6).
- `userFullName` = concaténation `FirstName + " " + LastName` faite côté serveur - ne pas re-splitter côté front, l'utiliser tel quel pour l'affichage.

>  **Bug potentiel - `accessTokenExpiresAt` codé en dur** : `AuthService.LoginAsync` calcule ce champ avec `DateTimeOffset.UtcNow.AddMinutes(15)` en dur dans le code, au lieu de lire `_settings.AccessTokenExpirationMinutes` (la valeur réellement utilisée pour signer le token dans `JwtTokenGenerator`). Aujourd'hui les deux valent 15 min par coïncidence (voir bug suivant), mais si quelqu'un change `AccessTokenExpirationMinutes` dans la config sans corriger ce hardcode, **le champ renvoyé au front mentira sur l'expiration réelle du token**. À signaler à l'équipe backend avant que le front ne bâtisse une logique de refresh silencieux dessus.

>  **Bug potentiel - décalage de nom de clé de config** : `appsettings.Development.json` définit `"JwtSettings": { "ExpirationInMinutes": 60, ... }`, mais la classe `JwtSettings.cs` attend une propriété nommée `AccessTokenExpirationMinutes` (pas `ExpirationInMinutes`). Le binding de config ne fera donc **pas le lien** entre les deux - `AccessTokenExpirationMinutes` retombera silencieusement sur sa valeur par défaut (`15`), et le `60` du fichier JSON restera lettre morte. Concrètement : le token expire probablement en 15 min, pas 60, malgré ce que dit `appsettings.Development.json`. À faire corriger côté back (soit renommer la clé JSON, soit renommer la propriété C#) avant que le front ne règle son intercepteur de refresh sur une durée supposée de 60 min.

**Réponse 401** si identifiants invalides :
```json
{ "message": "Identifiants invalides." }
```

**Réponse 400** si email/mot de passe manquant :
```json
{ "message": "Email et mot de passe sont obligatoires." }
```

### 2.2 Contenu du token JWT

Décodage du token observé en test (payload) :

| Claim | Exemple | Usage front |
| --- | --- | --- |
| `sub` | `d220de01-c4c2-...` | ID utilisateur courant (`user.Id`) |
| `email` | `admin@certeo.local` | Affichage |
| `.../claims/role` (`ClaimTypes.Role`) | `SUPER_ADMIN` | Confirmé dans `JwtTokenGenerator.cs` : le claim est ajouté via la constante .NET `ClaimTypes.Role`, qui sérialise sous l'URI longue `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` - **pas** `"role"`. Si le front décode le JWT côté client (ex. `jwt-decode`), utiliser cette clé exacte. |
| `jti` | GUID | Identifiant unique du token (`Guid.NewGuid()`), un par login |
| `exp` | timestamp Unix | Expiration réelle du token - voir bug de config ci-dessus (probablement 15 min, pas 60) |
| `iss` / `aud` | `CerteoApi` / `CerteoClients` | Doivent correspondre à `JwtSettings.Issuer` / `Audience` côté back |

**Refresh token - existe côté données, mais pas encore exploitable côté API** :
- `LoginResponse` renvoie bien un `refreshToken` (64 octets aléatoires en base64, généré par `JwtTokenGenerator.GenerateRefreshToken()`), et il est persisté en base (`RefreshTokens` table) avec une expiration à `RefreshTokenExpirationDays` (7 jours par défaut).
- **Mais `AuthController` n'expose aucune route `POST /api/auth/refresh`** (ni `/logout`) dans les fichiers fournis. Le refresh token est donc actuellement **généré et stocké, mais inutilisable depuis le front** - aucun endpoint ne permet de l'échanger contre un nouvel access token.
-  **Incohérence dans l'entité `RefreshToken`** (`IdentityEntities.cs`) : deux propriétés d'expiration coexistent, `ExpiresAt` et `DateExpiration`. `AuthService.LoginAsync` ne renseigne que `DateExpiration` à la création - `ExpiresAt` reste donc à sa valeur par défaut (`default(DateTimeOffset)`, soit une date dans le passé lointain). Si une future logique de validation du refresh token se base sur `ExpiresAt` plutôt que `DateExpiration`, **tous les refresh tokens paraîtront déjà expirés**. À signaler à l'équipe backend avant d'implémenter l'endpoint `/refresh`.

**Conséquence pour le front, en l'état actuel** : traiter l'authentification comme **sans refresh silencieux** pour l'instant - stocker `refreshToken` par anticipation si tu veux, mais ne rien construire dessus tant que l'endpoint et le bug d'entité ci-dessus ne sont pas réglés côté back. À l'expiration de l'`accessToken`, rediriger vers le login.

### 2.3 Intercepteur HTTP Angular (recommandation)

- Stocker le token (`accessToken`) après login - éviter `localStorage` en clair si possible, sinon documenter le choix pour l'équipe sécurité.
- Ajouter un `HttpInterceptor` qui injecte `Authorization: Bearer <token>` sur toutes les requêtes vers l'API, sauf celles explicitement publiques (`/api/auth/login`, `GET /api/trainings/slug/{slug}`).
- Intercepter les réponses `401` globalement → déconnexion + redirection login (le token backend ne se rafraîchit pas automatiquement).

---

## 3. Format des erreurs

Deux formats coexistent selon l'origine de l'erreur - le front doit gérer les deux.

### 3.1 Erreurs métier (via `ExceptionHandlingMiddleware`)

Toute exception métier levée dans les services est interceptée globalement et retourne un JSON simple `{ "message": "..." }` :

| Exception .NET | Code HTTP | Cas d'usage typique côté Trainings |
| --- | --- | --- |
| `DomainValidationException` | `400 Bad Request` | Dates incohérentes, capacité invalide, catégorie inexistante |
| `DomainConflictException` | `409 Conflict` | Publier une formation déjà publiée, supprimer une formation avec candidatures |
| `DomainNotFoundException` | `404 Not Found` | Formation inexistante (`GetById`, `Update`, `Publish`...) |
| *(autre)* | `500 Internal Server Error` | `{ "message": "Une erreur inattendue est survenue." }` - loggée côté serveur, ne pas afficher le détail brut à l'utilisateur |

```json
{ "message": "La date limite d'inscription doit être antérieure à la date de début." }
```

### 3.2 Erreurs de validation de modèle ASP.NET (avant d'atteindre le middleware)

Quand le JSON envoyé ne correspond pas au DTO attendu (type invalide, champ requis manquant), ASP.NET répond directement en `400` au format **ProblemDetails (RFC 9110)**, sans passer par le middleware :

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "$.categoryId": ["The JSON value could not be converted to ... Path: $.categoryId ..."]
  },
  "traceId": "00-bf08a59f..."
}
```
> Confirmé en test réel : envoyer une chaîne non-GUID (`"<CATEGORY_ID>"`) pour `categoryId` déclenche ce format, pas le format `{message}`. **Le front doit donc parser `errors` (dictionnaire de tableaux) en plus de `message`** pour un affichage d'erreur de formulaire cohérent.

---

## 4. Cartographie des routes Frontend ↔ Backend

| Route Frontend (Angular, indicative) | Service Front | Endpoint Backend | Méthode | Auth | Rôles autorisés |
| --- | --- | --- | --- | --- | --- |
| `/login` | `AuthService` | `/api/auth/login` | `POST` | Non | - |
| `/trainings` | `TrainingService` | `/api/trainings` | `GET` | Oui | Tout utilisateur authentifié |
| `/trainings/:id` | `TrainingService` | `/api/trainings/{id}` | `GET` | Oui | Tout utilisateur authentifié |
| `/formations/:slug` (page publique) | `TrainingService` | `/api/trainings/slug/{slug}` | `GET` | **Non** (`AllowAnonymous`) | - |
| `/trainings/create` | `TrainingService` | `/api/trainings` | `POST` | Oui | `SUPER_ADMIN`, `ADMIN`, `TRAINER` |
| `/trainings/:id/edit` | `TrainingService` | `/api/trainings/{id}` | `PUT` | Oui | `SUPER_ADMIN`, `ADMIN`, `TRAINER` |
| `/trainings/:id` (action publier) | `TrainingService` | `/api/trainings/{id}/publish` | `POST` | Oui | `SUPER_ADMIN`, `ADMIN`, `TRAINER` |
| `/trainings/:id` (action archiver) | `TrainingService` | `/api/trainings/{id}/archive` | `POST` | Oui | `SUPER_ADMIN`, `ADMIN`, `TRAINER` |
| `/trainings/:id` (action supprimer) | `TrainingService` | `/api/trainings/{id}` | `DELETE` | Oui | `SUPER_ADMIN`, `ADMIN` uniquement (pas `TRAINER`) |
| `/trainings/:id/form-config` | `TrainingService` | `/api/trainings/{id}/application-form` | `PUT` | Oui | `SUPER_ADMIN`, `ADMIN`, `TRAINER` |

<!-- > Les noms de routes Angular ci-dessus sont indicatifs (je n'ai pas les fichiers du front) - à ajuster à la structure réelle du repo Angular. Si tu me fournis le routing module ou les services Angular existants, je peux corriger cette colonne précisément. -->

**Vérification des rôles côté front** : le front doit répliquer cette matrice de rôles pour masquer les actions non autorisées dans l'UI (ex. bouton "Supprimer" caché pour un `TRAINER`), mais **le backend reste la seule source de vérité** - ne jamais se fier uniquement au masquage UI pour la sécurité.

---

## 5. Référence détaillée des endpoints Trainings

### `GET /api/trainings`
Liste paginée, avec filtres optionnels.

**Query params :**
| Param | Type | Obligatoire | Notes |
| --- | --- | --- | --- |
| `status` | `TrainingStatus` (string) | Non | `DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED` |
| `categoryId` | `guid` | Non | |
| `search` | `string` | Non | Recherche `ILIKE` sur titre + description |
| `page` | `int` | Non (défaut `1`) | |
| `pageSize` | `int` | Non (défaut `20`, borné entre 1 et 100 côté serveur) | |

**Réponse `PagedResult<TrainingListItemResponse>` :**
```json
{
  "items": [
    {
      "id": "guid",
      "title": "string",
      "imageUrl": "string | null",
      "categoryLabel": "string",
      "startDate": "2026-09-15",
      "endDate": "2026-12-15",
      "maxCapacity": 30,
      "applicationsCount": 0,
      "selectedCount": 0,
      "status": "DRAFT"
    }
  ],
  "totalCount": 0,
  "page": 1,
  "pageSize": 20,
  "totalPages": 0
}
```
*(Confirmé par le test réel : `{"items":[],"totalCount":0,"page":1,"pageSize":20,"totalPages":0}`.)*

### `GET /api/trainings/{id}` et `GET /api/trainings/slug/{slug}`
Retournent `TrainingDetailResponse` (404 si absent). La version `/slug/{slug}` est **publique** et filtre en plus sur `Status IN (PUBLISHED, IN_PROGRESS)` - une formation en `DRAFT` ou `ARCHIVED` n'est jamais visible via cette route, même avec le bon slug.

```json
{
  "id": "guid",
  "title": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "categoryId": "guid",
  "categoryLabel": "string",
  "startDate": "date",
  "endDate": "date",
  "applicationDeadline": "date",
  "location": "string | null",
  "mode": "IN_PERSON",
  "maxCapacity": 30,
  "minCapacity": 10,
  "targetAudience": "string | null",
  "socialMediaMessage": "string | null",
  "promotionalPosterUrl": "string | null",
  "isQuizMandatory": true,
  "isCertificateEnabled": true,
  "status": "DRAFT",
  "slug": "string",
  "createdByFullName": "string",
  "createdAt": "2026-08-20T10:00:00Z",
  "applicationsCount": 0,
  "selectedCount": 0,
  "completionRatePercent": 0,
  "applicationFields": [
    { "field": "FULL_NAME", "isActive": true, "isRequired": true }
  ],
  "customQuestions": [
    { "id": "guid", "prompt": "string", "type": "SHORT_TEXT", "options": null, "isRequired": true, "order": 0 }
  ]
}
```

### `POST /api/trainings`
Rôles : `SUPER_ADMIN`, `ADMIN`, `TRAINER`.

**Requête `CreateTrainingRequest` :**
```json
{
  "title": "Développement Web Fullstack",
  "description": "Bootcamp intensif",
  "imageUrl": null,
  "categoryId": "51dee000-48c7-4533-980a-2ad5bb205f51",
  "startDate": "2026-09-15",
  "endDate": "2026-12-15",
  "applicationDeadline": "2026-09-01",
  "location": "Douala",
  "mode": "IN_PERSON",
  "maxCapacity": 30,
  "minCapacity": 10,
  "targetAudience": null,
  "socialMediaMessage": null,
  "promotionalPosterUrl": null,
  "isQuizMandatory": true,
  "isCertificateEnabled": true,
  "publishImmediately": false
}
```

**Validations métier (en plus des types) :**
- `endDate` doit être strictement postérieure à `startDate`.
- `applicationDeadline` doit être strictement antérieure à `startDate`.
- `maxCapacity > 0`.
- `0 ≤ minCapacity ≤ maxCapacity`.
- `categoryId` doit référencer une ligne `ReferenceData` existante **avec `Type = CATEGORY`** (pas n'importe quel référentiel).

**Comportement automatique :**
- Un `slug` unique est généré côté serveur à partir du `title` (jamais fourni par le front, jamais modifiable ensuite - même si le titre change plus tard).
- Les 5 champs de candidature standards (`FULL_NAME`, `EMAIL`, `PHONE`, `LINKEDIN_URL`, `CV`) sont créés automatiquement, actifs, tous obligatoires **sauf `LINKEDIN_URL`**.
- `status` = `PUBLISHED` si `publishImmediately: true`, sinon `DRAFT`.

Réponse : `201 Created` avec `TrainingDetailResponse` + header `Location`.

### `PUT /api/trainings/{id}`
Même forme de payload que la création (`UpdateTrainingRequest`, sans `publishImmediately` ni `id`/`slug` - le slug est immuable). Refusé (`409`) si la formation est `ARCHIVED`.

### `POST /api/trainings/{id}/publish`
Passe `DRAFT` → `PUBLISHED`. Refusé (`409`) si le statut actuel n'est pas `DRAFT`. Réponse `204 No Content`.

### `POST /api/trainings/{id}/archive`
Passe n'importe quel statut → `ARCHIVED`, sauf si déjà `ARCHIVED` (`409`). Réponse `204 No Content`.

### `DELETE /api/trainings/{id}`
Rôles : `SUPER_ADMIN`, `ADMIN` **seulement** (contrairement aux autres actions d'écriture qui autorisent aussi `TRAINER`). Refusé (`409`) si la formation a déjà des candidatures - dans ce cas, archiver au lieu de supprimer. Réponse `204 No Content`.

### `PUT /api/trainings/{id}/application-form`
Configure les champs standards + questions personnalisées du formulaire de candidature.

```json
{
  "standardFields": [
    { "field": "EMAIL", "isActive": true, "isRequired": true }
  ],
  "customQuestions": [
    {
      "id": null,
      "prompt": "Pourquoi souhaitez-vous suivre cette formation ?",
      "type": "LONG_TEXT",
      "options": null,
      "isRequired": true,
      "order": 0
    }
  ]
}
```
- `id: null` → création d'une nouvelle question personnalisée ; `id` renseigné → mise à jour de la question existante.
- Toute question existante en base **absente** de la liste envoyée est **supprimée** (synchronisation complète, pas un ajout incrémental) - le front doit donc toujours renvoyer l'état complet du formulaire, pas seulement les champs modifiés.
- `options` n'a de sens que pour `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `DROPDOWN`.

Réponse : `204 No Content`.

---

## 6. Enums partagés (à répliquer côté Angular, ex. `enums.ts`)

| Enum | Valeurs |
| --- | --- |
| `RoleName` | `SUPER_ADMIN`, `ADMIN`, `TRAINER`, `RECEPTIONIST` |
| `ReferenceType` | `CATEGORY`, `GENDER`, `EDUCATION_LEVEL`, `ATTENDANCE_REASON`, `AGE_GROUP`, `VISITOR_PROFILE`, `ODC_DISCOVERY_SOURCE` |
| `TrainingMode` | `IN_PERSON`, `ONLINE`, `HYBRID` |
| `TrainingStatus` | `DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED` |
| `StandardApplicationField` | `FULL_NAME`, `EMAIL`, `PHONE`, `LINKEDIN_URL`, `CV` |
| `TrainingQuestionType` | `SHORT_TEXT`, `LONG_TEXT`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `DROPDOWN` |
| `ApplicationStatus` | `PENDING`, `IN_INTERVIEW`, `EVALUATED`, `SELECTED`, `REJECTED` |

>  **À vérifier avant de coder le front** : `Program.cs` ne déclare pas explicitement de `JsonStringEnumConverter` dans la config JSON de `AddControllers()`. Pourtant le test réel a envoyé `"mode":"IN_PERSON"` (chaîne) et ça a été accepté sans erreur de désérialisation. Avant de généraliser cette hypothèse à **tous** les enums et **dans les deux sens** (requête ET réponse), faites un `GET /api/trainings/{id}` sur une formation existante et vérifiez si `status`/`mode` reviennent en chaîne (`"DRAFT"`) ou en nombre (`0`). Si un converter est bien actif quelque part, tant mieux ; sinon il faudra soit l'ajouter côté back, soit mapper les entiers côté front - à trancher en équipe avant d'écrire les modèles Angular.

---

## 7. Points d'attention à traiter avant/pendant l'intégration front

| # | Sujet | Constat | Action suggérée |
| --- | --- | --- | --- |
| 1 | Endpoint des catégories | Aucun endpoint listant les `ReferenceData` (catégories) n'apparaît dans `TrainingsController` ni ailleurs dans les fichiers fournis. Le front n'a aujourd'hui aucun moyen HTTP de peupler un select de catégories pour le formulaire de création. | Vérifier s'il existe un `ReferenceDataController` ailleurs dans le repo ; sinon, en créer un avant que le front n'attaque l'écran de création de formation. |
| 2 | Refresh token inutilisable | `LoginResponse` renvoie un `refreshToken` généré et persisté, mais **aucun endpoint `/api/auth/refresh` n'existe** pour l'échanger. | Ne rien construire côté front sur le refresh silencieux tant que l'endpoint n'est pas livré. |
| 2b | Entité `RefreshToken` - double champ d'expiration | `ExpiresAt` et `DateExpiration` coexistent dans `IdentityEntities.cs` ; seul `DateExpiration` est renseigné à la création. Si l'endpoint `/refresh` (à venir) valide sur `ExpiresAt`, tous les tokens paraîtront expirés. | À corriger côté back (supprimer le champ en trop) avant d'implémenter `/refresh`. |
| 2c | `accessTokenExpiresAt` codé en dur | La valeur renvoyée au front (`AddMinutes(15)`) n'est pas dérivée de `JwtSettings.AccessTokenExpirationMinutes`, donc peut mentir si la config change. | Front : ne pas se fier aveuglément à ce champ pour planifier un refresh proactif - gérer plutôt le `401` en réactif. |
| 2d | Clé de config Jwt mal alignée | `appsettings.Development.json` déclare `ExpirationInMinutes: 60`, mais `JwtSettings.cs` attend `AccessTokenExpirationMinutes` - le binding échoue silencieusement, la vraie expiration retombe à 15 min (valeur par défaut C#), pas 60. | À corriger côté back. Le front doit supposer une expiration courte (15 min) tant que ce n'est pas fixé. |
| 3 | Sérialisation des enums `Training*` | Voir §6 - comportement à confirmer empiriquement (n'affecte pas `role` dans `LoginResponse`, qui est toujours une string simple). | Tester un `GET /api/trainings/{id}` réel et documenter le résultat ici une fois confirmé. |
| 4 | CORS `AllowAll` | Correct en dev, dangereux en prod (toute origine peut appeler l'API avec un token volé/rejoué). | Restreindre à l'origine du front en prod, dans `Program.cs`. |
| 5 | `HttpsRedirection` activé | `app.UseHttpsRedirection()` est actif - en HTTP pur (comme actuellement en `dotnet run` sans certif dev), ça peut renvoyer une redirection au lieu de la réponse attendue selon la config. | Si le front reçoit des redirections inattendues en dev, vérifier ce middleware. |

---

## 8. Étapes suivantes recommandées

1. **Swagger** reste la référence exacte des contrats - à consulter en cas de doute sur un champ.
2. Exporter une **collection Thunder Client** (`docs/integration/thunder-collection.json`) avec les requêtes de ce document préconfigurées et une variable d'environnement `{{token}}`, pour que toute l'équipe puisse tester sans tout ressaisir.
3. Faire trancher par l'équipe back les 4 points de bugs identifiés en §7 (refresh token inutilisable, double champ d'expiration, `accessTokenExpiresAt` codé en dur, clé de config mal alignée) avant que le front ne bâtisse sa logique d'auth dessus.
4. Une fois le point #1 du tableau §7 tranché (endpoint catégories), mettre à jour ce document et le tableau de cartographie §4.
5. Ce fichier est à committer dans `docs/integration/trainings-integration.md` à la racine du repo (voir convention multi-features), versionné avec le code - à maintenir à jour à chaque évolution de contrat (nouveau champ DTO, nouvelle route, changement de rôle requis, etc.).