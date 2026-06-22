# Backlog Taiga : Statistiques centrées Élève (Performances, Implication & Absences)

Le focus principal : l'application est centrée sur l'élève. L'objectif est de lui permettre de suivre sa progression, sa motivation et son implication dans un cours à partir des évaluations fournies par les enseignants.

---

## Épic : Tableau de bord Élève — Suivi de progression
Objectif : Permettre à chaque étudiant de visualiser son évolution par matière, son niveau d'implication (présence, remises de devoirs) et sa motivation (tendances de performance), afin de s'auto-orienter.

---

### User Story 1 : Voir mon tableau de bord personnel
- En tant qu'élève, je veux consulter ma moyenne actuelle, le détail par matière, ma progression et des indicateurs d'implication pour suivre mon évolution.
- Priorité : Très élevée
- Estimation : 5

Tâches :
- Produire données mock centrées élève (notes, remises, présences, activité)
- Implémenter computeStudentAverage et computeEngagementScore (service)
- Implémenter useStudentStats (hook) combinant performance + implication
- Composants UI : StudentPerformanceCard, EngagementKPI, ProgressTrendChart
- Route : /statistics/me

Critères d'acceptation :
- L'élève voit sa moyenne par matière, un score d'implication (ex: % devoirs remis) et un graphique de tendance
- Données par défaut via mockAdapter
- Tests unitaires pour computeStudentAverage et computeEngagementScore

---

### User Story 2 : Feedback actionnable
- En tant qu'élève, je veux des recommandations simples (p.ex. "Travailler les mathématiques — revoir chap.3") et des objectifs à court terme pour m'améliorer.
- Priorité : Élevée
- Estimation : 5

Tâches :
- Définir règles basiques de recommandation (seuils de moyenne, chute de tendance, absentéisme)
- Implémenter service generateRecommendations(stats)
- UI : RecommendationsCard avec actions (marquer "Déjà fait", créer rappel)

Critères d'acceptation :
- Au moins 3 types de recommandations générées automatiquement
- L'utilisateur peut marquer une recommandation comme accomplie

---

### User Story 3 : Suivi de l'implication (présences & devoirs)
- En tant qu'élève, je veux voir mon taux de présence et mon historique de remises (délais) pour mesurer mon engagement.
- Priorité : Élevée
- Estimation : 4

Tâches :
- Modèle Absence + modèle Submission (devoirs remis avec date)
- Implémenter aggregateAbsences et computeSubmissionRate
- UI : AbsenceTimeline, SubmissionKPI

Critères d'acceptation :
- L'élève voit son taux d'absences et % de devoirs remis à temps
- Filtres par période

---

### User Story 4 : Historique et tendances
- En tant qu'élève, je veux consulter l'évolution (courbe) de mes notes et de mon implication pour détecter des améliorations ou baisses.
- Priorité : Moyenne
- Estimation : 4

Tâches :
- Services pour générer séries temporelles (rolling average)
- Graphiques interactifs (range selector)

Critères d'acceptation :
- Courbe de progression affichée et zoomable

---

### User Story 5 : Confidentialité et contrôle
- En tant qu'élève, je veux contrôler qui voit mes données (par défaut privé), et pouvoir anonymiser certaines informations.
- Priorité : Moyenne
- Estimation : 3

Tâches :
- Ajouter préférence privacy dans dashboard_settings
- UI pour configurer visibilité (privé / partage avec prof)

Critères d'acceptation :
- Option de partage visible dans le dashboard

---

### User Story 6 : Adapter & mock (infrastructure)
- En tant que développeur, je veux une interface d'adapter stable pour changer la persistance sans impacter l'UI.
- Priorité : Très élevée
- Estimation : 3

Tâches :
- Définir interface adapter (fetchGrades, fetchAbsences, fetchSubmissions, fetchStudentActivity)
- Implémenter mockAdapter (JSON + msw)
- Documenter le contrat d'API côté frontend

Critères d'acceptation :
- Changer d'adapter nécessite une modification unique au composition root

---

### User Story 7 : Tests & qualité
- En tant qu'équipe, nous voulons des tests pour les services et hooks afin d'assurer fiabilité et évolutivité.
- Priorité : Élevée
- Estimation : 4

Tâches :
- Tests unitaires pour computeStudentAverage, computeEngagementScore, generateRecommendations
- Tests d'intégration hook + msw

Critères d'acceptation :
- Couverture raisonnable des services critiques

---

## Idées supplémentaires (phase 1)
- Score d'engagement combinant présence, remises à l'heure et évolution des notes.
- Badges motivants (p.ex. "Régulier", "Progression 10%") pour encourager l'étudiant.
- Rappels locaux (notifications) pour devoirs à rendre.
- Vue comparée anonymisée : voir la moyenne de la classe sans noms pour se situer.

---

## Labels recommandés
- composant : adapter, service, hook, ui, tests, docs
- priorité : tres-élevée, élevée, moyenne, faible

---

## Import dans Taiga
Copier chaque User Story en français dans Taiga sous l'épic "Tableau de bord Élève — Suivi de progression". Ajouter les tâches en sous-tâches et estimer en story points. Utiliser les labels pour tri et priorité.
