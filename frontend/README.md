# Certeo Frontend 🚀

Application frontend Angular pour la plateforme **CERTEO** (Orange Digital Center).

> 📚 **Documentation Complète de l'Architecture & Guide Développeur** :  
> Consultez le fichier [**`ARCHITECTURE.md`**](ARCHITECTURE.md) pour la structure détaillée, les conventions, les exemples de code et le guide de travail en équipe.

---

## ⚡ Démarrage Rapide

```bash
# 1. Accéder au dossier frontend
cd frontend

# 2. Installer les dépendances
pnpm install

# 3. Lancer le serveur local (http://localhost:4200)
pnpm start
```

---

## 📁 Vue Rapide de l'Arborescence

```text
src/
├── app/
│   ├── core/         ← Services singletons (API, Auth, Interceptors, Guards) [@core]
│   ├── shared/       ← Composants réutilisables (Table, Badges, Stepper, Dialogs) [@shared]
│   ├── layouts/      ← Gabarits d'écran (AdminLayout, PublicLayout, AuthLayout) [@layouts/*]
│   └── features/     ← Modules métier indépendants (1 dev = 1 module) [@features/*]
│       ├── auth/          (Connexion)
│       ├── dashboard/     (Tableau de bord)
│       ├── trainings/     (Formations)
│       ├── applications/  (Candidatures)
│       ├── presence/      (Présences & QR Code)
│       ├── evaluations/   (QCM & Examens)
│       ├── certificates/  (Attestations ODC)
│       ├── participants/  (Profils apprenants)
│       ├── reporting/     (Analytics & KPIs)
│       └── settings/      (Configuration système)
├── styles/           ← Tokens SCSS Orange ODC (#ff7900), Mixins, Typography
└── environments/     ← Configurations Dev & Prod [@env/*]
```

---

## 🛠️ Commandes Utiles

| Commande | Action |
| :--- | :--- |
| `pnpm start` | Lance le serveur de dev sur `http://localhost:4200` |
| `pnpm run build` | Compile et vérifie l'application de production |
| `pnpm run test` | Exécute les tests unitaires avec Vitest |

---

## 👥 Workflow Git pour l'Équipe

1. Partir de la branche `develop` : `git checkout develop && git pull`
2. Créer sa branche : `git checkout -b feature/<nom-du-module>` (ex: `feature/trainings`)
3. Travailler dans son sous-dossier `features/<nom-du-module>/`
4. Pousser et ouvrir une Pull Request vers `develop`
