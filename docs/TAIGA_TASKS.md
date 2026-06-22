# Backlog Taiga : Statistiques & Tableau de bord (Performances & Absences)

Ci-dessous les user stories, tâches, critères d'acceptation et estimations suggérées à copier dans Taiga.

---

## Épic : Statistiques étudiantes & Tableau de bord
Objectif : Fournir des rapports et visualisations des performances et des absences pour les élèves, enseignants et administrateurs.

---

### User Story 1 : Consulter mon tableau de bord de performance
- En tant qu'élève, je veux voir ma moyenne actuelle, le détail par matière et la tendance pour suivre ma progression.
- Priorité : Élevée
- Estimation : 5

Tâches :
- Créer des données mock pour un élève exemple
- Implémenter le service computeStudentAverage
- Implémenter le hook useStudentStats
- Construire le composant StudentPerformanceCard (UI)
- Construire le PerformanceChart (Recharts)
- Ajouter la route /statistics/me et le container

Critères d'acceptation :
- L'élève peut ouvrir /statistics/me et voir la moyenne, la liste des matières et un graphique de tendance
- Les données proviennent de l'adapter mock
- Tests unitaires couvrent computeStudentAverage

---

### User Story 2 : Consulter les statistiques de la classe
- En tant qu'enseignant, je veux voir la moyenne de la classe, les meilleurs/moins bons élèves et la distribution des notes.
- Priorité : Élevée
- Estimation : 8

Tâches :
- Implémenter fetchClassGrades dans l'adapter
- Implémenter computeClassAverage et gradeDistribution
- Construire le container ClassOverviewDashboard et ses composants (UI)
- Ajouter filtres de classe et sélecteur de période

Critères d'acceptation :
- L'enseignant peut voir la moyenne de la classe et le top5 / bottom5
- Le graphique de distribution affiche des buckets (A-F)
- Le hook accepte une plage de dates

---

### User Story 3 : Suivre et rapporter les absences
- En tant qu'enseignant/administrateur, je veux consulter l'historique des absences et les tendances par classe.
- Priorité : Moyenne
- Estimation : 5

Tâches :
- Créer le modèle Absence et des données mock
- Implémenter fetchAbsences dans l'adapter
- Implémenter aggregateAbsences dans les services
- Construire AbsenceCard, AbsenceChart, AbsenceTable (UI)

Critères d'acceptation :
- Timeline des absences et KPI de synthèse visibles
- Filtre possible par justifié / non justifié

---

### User Story 4 : Abstraction d'adapter & implémentation mock
- En tant que développeur, je veux une interface d'adapter unique pour pouvoir remplacer le backend facilement.
- Priorité : Élevée
- Estimation : 3

Tâches :
- Définir l'interface d'adapter (fetchGrades, fetchAbsences, fetchClassGrades, watch optionnel)
- Implémenter mockAdapter (fichiers JSON + msw)
- Documenter l'utilisation dans le README

Critères d'acceptation :
- Changer d'adapter ne nécessite que de modifier l'import au niveau du composition root
- mockAdapter renvoie des données réalistes

---

### User Story 5 : Tests unitaires pour les services
- En tant que développeur, je veux des tests unitaires pour assurer la fiabilité des calculs.
- Priorité : Élevée
- Estimation : 3

Tâches :
- Ajouter des tests pour computeStudentAverage, computeClassAverage, gradeDistribution, detectTrend
- Configurer le runner de tests (Vitest/Jest)

Critères d'acceptation :
- Les services ont des tests avec couverture raisonnable (>80% branches recommandées)

---

### User Story 6 : Graphiques & export
- En tant qu'enseignant, je veux exporter les rapports de performance et d'absences au format CSV.
- Priorité : Moyenne
- Estimation : 5

Tâches :
- Ajouter une utilité d'export CSV dans les services
- Ajouter un bouton Export sur les tableaux de bord
- Implémenter la génération et le téléchargement CSV côté client

Critères d'acceptation :
- Le CSV exporté contient les colonnes et lignes attendues selon les filtres

---

### User Story 7 : Contrôle d'accès par rôle (côté front)
- En tant qu'administrateur, je veux que les vues soient restreintes selon le rôle utilisateur.
- Priorité : Moyenne
- Estimation : 3

Tâches :
- Ajouter vérifications de rôle dans les containers de route
- Masquer/afficher les éléments UI selon le rôle

Critères d'acceptation :
- Les élèves ne peuvent pas accéder aux tableaux de bord de classe
- Les enseignants ne voient que leurs classes (imposé en mock pour l'instant)

---

## Labels et Tags
- composant : adapter, service, hook, ui, tests, docs
- priorité : élevée, moyenne, faible

---

## Importer dans Taiga
Copier chaque user story dans Taiga sous l'épic "Statistiques étudiantes & Tableau de bord". Ajouter les tâches en sous-tâches et les estimations en points. Utiliser les labels pour taguer composant et priorité.
