import type { Module, UserProfile } from '../types'

export const profile: UserProfile = {
  name: "Abdessamad Abounouh",
  initials: "AA",
  track: "Développement Web Full-Stack",
  startDate: "2024-09-01",
}

export const modules: Module[] = [
  {
    id: "m1",
    title: "HTML & CSS",
    description: "Les fondations du web : structure et mise en forme.",
    color: "#1D9E75",
    chapters: [
      {
        id: "m1-c1", title: "Bases HTML",
        lessons: [
          { id: "m1-c1-l1", title: "Structure d'une page HTML", duration: "15 min", content: "Une page HTML est composée d'un DOCTYPE, d'une balise <html>, d'un <head> et d'un <body>. Le <head> contient les métadonnées, le <body> contient le contenu visible." },
          { id: "m1-c1-l2", title: "Les balises sémantiques", duration: "20 min", content: "Les balises sémantiques comme <header>, <main>, <footer>, <article> ou <section> donnent du sens à votre contenu pour les navigateurs et le SEO." },
          { id: "m1-c1-l3", title: "Formulaires HTML", duration: "25 min", content: "Les formulaires permettent de collecter des données utilisateur. Les éléments clés sont <form>, <input>, <label>, <select> et <button>." },
        ]
      },
      {
        id: "m1-c2", title: "CSS Fondamentaux",
        lessons: [
          { id: "m1-c2-l1", title: "Sélecteurs et propriétés", duration: "20 min", content: "CSS sélectionne les éléments HTML via des sélecteurs (classe, id, tag) et applique des propriétés comme color, font-size, margin, padding." },
          { id: "m1-c2-l2", title: "Le modèle de boîte", duration: "15 min", content: "Chaque élément est une boîte composée de : content, padding, border, margin. Comprendre ce modèle est essentiel pour maîtriser les espacements." },
          { id: "m1-c2-l3", title: "Flexbox", duration: "30 min", content: "Flexbox est un système de mise en page 1D. Avec display: flex sur le parent, on contrôle l'alignement des enfants via justify-content, align-items et flex-wrap." },
        ]
      },
    ]
  },
  {
    id: "m2",
    title: "JavaScript",
    description: "Le langage de programmation du web.",
    color: "#7F77DD",
    chapters: [
      {
        id: "m2-c1", title: "Les bases JS",
        lessons: [
          { id: "m2-c1-l1", title: "Variables et types", duration: "20 min", content: "JavaScript utilise let, const et var pour déclarer des variables. Les types primitifs sont : string, number, boolean, null, undefined." },
          { id: "m2-c1-l2", title: "Fonctions", duration: "25 min", content: "Les fonctions sont des blocs réutilisables. On peut les déclarer avec function ou en flèche : const add = (a, b) => a + b." },
          { id: "m2-c1-l3", title: "Tableaux et objets", duration: "30 min", content: "Les tableaux stockent des listes ordonnées, les objets stockent des paires clé-valeur. Les méthodes map, filter et reduce sont essentielles." },
        ]
      },
      {
        id: "m2-c2", title: "JS Avancé",
        lessons: [
          { id: "m2-c2-l1", title: "Promesses & async/await", duration: "35 min", content: "Les promesses gèrent l'asynchrone. async/await est du sucre syntaxique qui rend le code asynchrone lisible comme du code synchrone." },
          { id: "m2-c2-l2", title: "DOM Manipulation", duration: "30 min", content: "Le DOM est la représentation objet d'une page HTML. JavaScript peut lire et modifier le DOM via document.querySelector, addEventListener, innerHTML." },
        ]
      },
    ]
  },
  {
    id: "m3",
    title: "React",
    description: "La bibliothèque UI de Meta pour créer des interfaces.",
    color: "#BA7517",
    chapters: [
      {
        id: "m3-c1", title: "Fondamentaux React",
        lessons: [
          { id: "m3-c1-l1", title: "Composants et JSX", duration: "25 min", content: "React découpe l'UI en composants réutilisables. JSX est une syntaxe qui ressemble à du HTML dans JavaScript et se compile en React.createElement." },
          { id: "m3-c1-l2", title: "Props et State", duration: "30 min", content: "Les props passent des données parent → enfant. Le state (useState) gère l'état local d'un composant et déclenche un re-render à chaque changement." },
          { id: "m3-c1-l3", title: "useEffect", duration: "30 min", content: "useEffect exécute des effets de bord (fetch, abonnements) après le rendu. Le tableau de dépendances contrôle quand l'effet se relance." },
        ]
      },
    ]
  },
  {
    id: "m4",
    title: "Algorithmes",
    description: "Résolution de problèmes et structures de données.",
    color: "#D4537E",
    chapters: [
      {
        id: "m4-c1", title: "Complexité & Tri",
        lessons: [
          { id: "m4-c1-l1", title: "Notation Big O", duration: "20 min", content: "La notation Big O mesure la complexité temporelle et spatiale d'un algorithme. O(1) est constant, O(n) linéaire, O(n²) quadratique." },
          { id: "m4-c1-l2", title: "Algorithmes de tri", duration: "40 min", content: "Bubble sort, selection sort, merge sort et quicksort. Merge sort et quicksort ont une complexité O(n log n) et sont préférés en pratique." },
        ]
      },
    ]
  },
]
