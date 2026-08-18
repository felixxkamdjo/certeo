# Certeo Frontend

Application frontend Angular pour le projet Certeo.

## 🚀 Préréquis

Assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version LTS recommandée)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## 📥 Clonage du projet

```bash
git clone <URL_DU_DEPOT>
cd certeo/frontend
```

## 📦 Installation des dépendances

Installez les dépendances avec **pnpm** :

```bash
pnpm install
```

## 🏃‍♂️ Lancement du projet

Pour démarrer le serveur de développement local :

```bash
pnpm run start
# ou directement avec Angular CLI / pnpm
pnpm exec ng serve --port 8080 --open
```

L'application sera accessible sur `http://localhost:8080/`.

## 🛠️ Autres commandes utiles

### Construction (Build)

Pour générer les fichiers de production :

```bash
pnpm run build
```

### Tests unitaires

Pour exécuter les tests unitaires avec Vitest :

```bash
pnpm run test
```

