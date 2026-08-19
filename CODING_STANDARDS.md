# Normes de Nommage et Conventions d'Écriture (Front & Back) — CERTEO

Ce document définit la convention de nommage standardisée pour garantir une cohérence fluide entre le **Front-end** (Angular) et le **Back-end** (.NET 10).

---

## 1. Synthèse des Cas de Casse (Casing)

| Élément | Convention Standard | Exemple | Contextes d'utilisation |
| :--- | :--- | :--- | :--- |
| **JSON API (Payloads)** | `camelCase` | `firstName`, `createdAt` | Requêtes/Réponses entre Front et Back |
| **Variables / Propriétés** | `camelCase` | `userId`, `isPending` | TypeScript, JavaScript, C# (DTOs/JSON) |
| **Classes / Interfaces / Types** | `PascalCase` | `UserProfile`, `AuthService` | Types & Modèles Front/Back |
| **Constantes / Enums** | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DRAFT` | Valeurs immuables globales |
| **Colonnes BDD / Tables** | `snake_case` | `user_id`, `created_at` | Base de données (PostgreSQL / MySQL) |
| **Clés de Traduction (i18n)** | `dot.notation` + `snake_case` | `auth.login.error_message` | Fichiers de langues JSON/YAML |
| **Routes d'API (URLs)** | `kebab-case` | `/api/v1/user-profiles` | REST Endpoints |

---

## 2. Contrat d'Échange API REST (JSON)

C'est sur le contrat d'échange (JSON) que la cohérence est primordiale :

### Payloads JSON en `camelCase`
Même si la base de données utilise le `snake_case` (`first_name`), le back-end **doit sérialiser ses réponses en `camelCase`** (`firstName`) pour respecter le standard du web.
* **.NET 10 :** Activé par défaut avec `System.Text.Json` (`PropertyNamingPolicy = JsonNamingPolicy.CamelCase`).

### Routes d'API (URLs)
* Utiliser le `kebab-case` et le **pluriel** pour les ressources :
  * `GET /api/v1/trainings`
  * `POST /api/v1/presences/check-in`
  * `GET /api/v1/candidate-applications`

---

## 3. Conventions de Nommage dans le Code

### Booléens
Toujours faire précéder d'un verbe d'état (`is`, `has`, `can`, `should`).
* **Correct :** `isActive`, `hasPermission`, `canEdit`, `isOpen`, `isWithinPerimeter`
* **À éviter :** `active`, `permission`, `status`

### Tableaux et Collections
Toujours au pluriel ou avec un suffixe explicite.
* **Correct :** `trainings`, `applications`, `itemList`
* **À éviter :** `training` (pour désigner une liste)

### Fonctions et Méthodes
Utiliser une structure **Verbe + Nom**.
* **Correct :** `getUserById()`, `calculateTotal()`, `submitAnswers()`, `checkLocation()`

---

## 4. Textes, Internationalisation (i18n) et Données

### Clés de Traduction Hiérarchiques (`dot.notation`)
Utiliser la notation pointée pour classifier les clés de traduction :
```json
{
  "common": {
    "button": {
      "save": "Enregistrer",
      "cancel": "Annuler"
    }
  },
  "auth": {
    "error": {
      "invalid_credentials": "Identifiants incorrects."
    }
  }
}
```

### Dates et Formats Numériques
* **Back-end :** Envoie toujours les dates au format standard ISO 8601 UTC (`2026-08-18T13:44:45Z`).
* **Front-end :** Reçoit le timestamp ISO UTC (`string`) et gère le formatage visuel via les Pipes Angular (ex: `DateFrPipe` -> `18/08/2026`).
