# Module : Formations (`features/trainings`)

## 📋 Périmètre Fonctionnel
- Liste des formations avec statuts (Brouillon, Publiée, En cours, Terminée)
- Création de formation en 4 étapes (Infos générales, Planification, Communication, Formulaire)
- Fiche de détails d'une formation

## 🎨 Maquettes de Référence (`stitch_certeo_ux_design_plan/`)
- `gestion_des_formations_liste_web_fr`
- `gestion_des_formations_d_tails_web_fr`
- `gestion_des_formations_cr_ation_web_fr`
- `cr_ation_formation_tape_1_informations_harmonis`
- `cr_ation_formation_tape_2_planification_harmonis`
- `cr_ation_formation_tape_3_communication_harmonis`
- `cr_ation_formation_tape_4_formulaire_harmonis`

## 🧩 Structure
- `pages/` : `training-list`, `training-create`, `training-detail`
- `services/` : `TrainingService`
- `models/` : `Training`, `CreateTrainingDto`, `TrainingStatus`
