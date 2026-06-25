import { useState, useEffect, useCallback } from 'react'
import type { SubjectChapter } from '../types'

const DEFAULT_CHAPTERS_MAP: Record<string, { title: string; content: string }[]> = {
  'algorithmes': [
    { title: 'Introduction à la complexité', content: 'Étude de la complexité algorithmique temporelle et spatiale, notation grand O.' },
    { title: 'Algorithmes de tri', content: 'Merge sort, quicksort, heap sort, et analyse comparative de leurs performances.' },
    { title: 'Algorithmes de graphes', content: 'Parcours en largeur (BFS), parcours en profondeur (DFS), et recherche de plus court chemin (Dijkstra).' }
  ],
  'web': [
    { title: 'Bases HTML & CSS', content: 'Structure sémantique HTML5, sélecteurs CSS, modèle de boîte, Flexbox et Grid.' },
    { title: 'Langage JavaScript', content: 'Variables, types de données, fonctions fléchées, tableaux, programmation asynchrone (Promises, async/await).' },
    { title: 'Framework React', content: 'Composants, props, state (useState), cycle de vie et effets (useEffect), et architecture flux.' }
  ],
  'donnees': [
    { title: 'Modèle Relationnel', content: 'Conception de schémas relationnels, clés primaires et étrangères, intégrité référentielle.' },
    { title: 'SQL Avancé', content: 'Requêtes complexes, sous-requêtes corrélées, fonctions de fenêtrage (window functions), et transactions.' },
    { title: 'NoSQL & Indexation', content: 'Introduction aux bases documentaires (MongoDB) et optimisation des requêtes via les index.' }
  ],
  'distribues': [
    { title: 'Architectures Distribuées', content: 'Principes fondamentaux, communication RPC/gRPC, architectures orientées services et microservices.' },
    { title: 'Conteneurisation (Docker)', content: 'Création d\'images Docker, Dockerfiles, gestion des volumes et mise en réseau avec Docker Compose.' },
    { title: 'Orchestration (Kubernetes)', content: 'Déploiement de conteneurs à grande échelle, Pods, Services, Deployments et Ingress controllers.' }
  ],
  'projet': [
    { title: 'Méthodologies de Projet', content: 'Comparaison des approches prédictives (Waterfall) et adaptatives (Agile).' },
    { title: 'Framework SCRUM', content: 'Rôles (Product Owner, Scrum Master, Developers), événements (Sprints, Dailies, Planning) et artefacts.' },
    { title: 'Planification & Estimation', content: 'Estimation des tâches (Story Points, Poker Planning), diagramme de Gantt et suivi budgétaire.' }
  ],
  'securite': [
    { title: 'Cryptographie', content: 'Cryptographie symétrique et asymétrique, clés de chiffrement, certificats SSL/TLS et hachage (SHA-256).' },
    { title: 'Vulnérabilités OWASP', content: 'Étude des failles courantes du web : injections SQL, XSS, CSRF, et contournement d\'authentification.' },
    { title: 'Tests de Pénétration', content: 'Méthodologie de pentest, collecte d\'informations, balayage, exploitation de failles et rédaction de rapports.' }
  ]
}

function getDefaultChapters(subjectName: string): SubjectChapter[] {
  const clean = subjectName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
  
  let matchKey = ''
  if (clean.includes('algo')) matchKey = 'algorithmes'
  else if (clean.includes('web')) matchKey = 'web'
  else if (clean.includes('donnee') || clean.includes('bdd') || clean.includes('base')) matchKey = 'donnees'
  else if (clean.includes('distrib') || clean.includes('res') || clean.includes('infra')) matchKey = 'distribues'
  else if (clean.includes('projet') || clean.includes('gestion')) matchKey = 'projet'
  else if (clean.includes('secur') || clean.includes('cyber')) matchKey = 'securite'

  const items = DEFAULT_CHAPTERS_MAP[matchKey] || [
    { title: 'Chapitre 1 : Introduction', content: 'Présentation générale et concepts fondamentaux du cours.' },
    { title: 'Chapitre 2 : Méthodologie', content: 'Mise en œuvre des notions théoriques et exercices pratiques.' },
    { title: 'Chapitre 3 : Projet & Application', content: 'Réalisation d\'études de cas réels et de projets applicatifs.' }
  ]

  return items.map((it, idx) => ({
    id: `ch-${matchKey || 'gen'}-${idx + 1}`,
    title: it.title,
    content: it.content,
    resources: []
  }))
}

export function useChapters(subjectId: string, subjectName?: string) {
  const [chapters, setChapters] = useState<SubjectChapter[]>([])

  useEffect(() => {
    if (!subjectId) return
    const raw = localStorage.getItem(`chapters_${subjectId}`)
    if (raw) {
      setChapters(JSON.parse(raw))
    } else {
      const defaults = getDefaultChapters(subjectName ?? '')
      setChapters(defaults)
      localStorage.setItem(`chapters_${subjectId}`, JSON.stringify(defaults))
    }
  }, [subjectId, subjectName])

  const save = useCallback((updated: SubjectChapter[]) => {
    setChapters(updated)
    localStorage.setItem(`chapters_${subjectId}`, JSON.stringify(updated))
  }, [subjectId])

  const addChapter = useCallback((title: string, content?: string) => {
    const chapter: SubjectChapter = {
      id: crypto.randomUUID(),
      title,
      content: content ?? '',
      resources: [],
    }
    save([...chapters, chapter])
  }, [chapters, save])

  const updateChapter = useCallback((id: string, data: Partial<SubjectChapter>) => {
    save(chapters.map(c => c.id === id ? { ...c, ...data } : c))
  }, [chapters, save])

  const removeChapter = useCallback((id: string) => {
    save(chapters.filter(c => c.id !== id))
  }, [chapters, save])

  return { chapters, addChapter, updateChapter, removeChapter, save }
}
