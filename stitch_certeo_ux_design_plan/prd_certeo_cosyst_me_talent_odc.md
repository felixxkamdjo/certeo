# PRD - Écosystème de Gestion des Talents CERTEO (Orange Digital Center)

## 1. Vision du Produit
CERTEO est une plateforme web et mobile intégrée conçue pour Orange Digital Center (ODC) afin de digitaliser et centraliser la gestion du cycle de vie des talents : de la première visite à l'obtention de certificats, en passant par la candidature, la formation et l'évaluation.

## 2. Objectifs Stratégiques
- **Digitalisation de la présence** : Remplacer les registres papier par un système QR Code et formulaires mobiles.
- **Optimisation du recrutement** : Automatiser le tunnel de candidature et la communication avec les candidats.
- **Suivi Pédagogique** : Centraliser les évaluations (QCM) et la génération d'attestations de réussite.
- **Pilotage par la donnée** : Offrir des tableaux de bord analytiques pour le reporting global.

## 3. Profils Utilisateurs
- **Super Administrateur** : Création et gestion des administrateurs.
- **Administrateur** : Gestion quotidienne (Formations, Candidats, Utilisateurs, Présences).
- **Visiteur / Candidat** : Utilisation des formulaires mobiles (Présence, Candidature, Passage de Quiz).

## 4. Spécifications Fonctionnelles

### 4.1. Authentification & Profils
- Interface de connexion sécurisée (Web & Mobile).
- Menu profil avec raccourcis (Paramètres, Déconnexion).
- Gestion des rôles (Admin vs Super Admin).

### 4.2. Gestion des Présences (Module ODC Presence)
- **Côté Admin** : Tableau de bord des présences avec filtres par date et formation, export CSV, et configurateur de formulaire dynamique.
- **Côté Visiteur** : Parcours mobile en 2 étapes (Infos personnelles -> Motif de visite -> Sélection formation si applicable).
- **QR Code** : Génération et gestion des QR Codes d'entrée.

### 4.3. Gestion des Formations
- Processus de création en 4 étapes :
    1. Informations Générales.
    2. Planification & Lieu.
    3. Communication & Audience (Social media, cible).
    4. Configurateur de formulaire de candidature.
- Liste des formations avec actions (Détails, Modifier, Archivage).

### 4.4. Gestion des Candidatures
- Tunnel de candidature mobile en 4 étapes (Infos, Parcours, Expérience, Motivation).
- Liste des candidats par formation avec filtrage par statut (En attente, Entretien, Refusé).
- Communication : Envoi de mails individuels ou groupés directement depuis la plateforme.

### 4.5. Évaluations & Certificats
- Créateur de QCM (Questions, propositions, réponses indexées).
- Interface candidat pour le passage de quiz (vue externe simplifiée).
- Génération automatique d'attestations de réussite officielles.

### 4.6. Reporting & Paramètres
- Tableau de bord analytique (KPIs : Candidatures, Visiteurs, Formations actives).
- Configuration système (Localisation FR, Paramètres de sécurité).

## 5. Identité Visuelle
- **Nom** : CERTEO.
- **Couleurs** : Orange (#ff7900), Noir, Blanc (Surface).
- **Typographie** : Hanken Grotesk.
- **Style** : Professionnel, épuré, centré sur l'utilisateur (Orange Digital Center).

## 6. Architecture Technique (UI/UX)
- **Web Desktop** : Pour l'administration et le reporting.
- **Web Mobile** : Pour les formulaires publics (Présence, Candidature) et le passage de quiz.
