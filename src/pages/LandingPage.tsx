import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoLight from '../assets/logoedutrack.png'
import teamAvatar from '../assets/team-avatar.png'
import './LandingPage.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string
  role: string
  bio: string
  phone: string
  email: string
  github: string
  linkedin: string
  initials: string
  color: string
}

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
  badge?: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const teamMembers: TeamMember[] = [
  {
    name: 'Zakaria Guennani',
    role: 'Développeur Full-Stack & Chef de Projet',
    bio: 'Passionné par la création d\'applications web évolutives. A conçu la plateforme EduTrack de la base de données à l\'interface utilisateur, guidant l\'équipe vers une expérience étudiant fluide.',
    phone: '06 24 64 87 34',
    email: 'z.guennai.dev@gmail.com',
    github: 'G-Zak',
    linkedin: 'zakaria-guennani',
    initials: 'ZG',
    color: '#065f46',
  },
  {
    name: 'Yassine Mchereg',
    role: 'Ingénieur Backend & Architecte Base de Données',
    bio: 'Expert en systèmes backend et conception de bases de données. A construit l\'infrastructure Supabase, les API REST et les pipelines de données en temps réel qui alimentent le moteur d\'analyse d\'EduTrack.',
    phone: '06 48 49 91 94',
    email: 'yassinamcherag02@gmail.com',
    github: 'yassine1985',
    linkedin: 'mcheregyassine',
    initials: 'YM',
    color: '#0e7490',
  },
  {
    name: 'Abdessamad Abounouh',
    role: 'Développeur Frontend & Designer UI/UX',
    bio: 'A conçu l\'interface intuitive d\'EduTrack en mettant l\'accent sur l\'accessibilité et l\'élégance. Responsable du système de design, de la bibliothèque de composants et des flux de travail centrés sur l\'utilisateur.',
    phone: '06 24 95 69 57',
    email: 'abdessamadstuff@gmail.com',
    github: 'AbdessamadAb04',
    linkedin: 'abdessamad-abounouh-4a0344339',
    initials: 'AA',
    color: '#7c3aed',
  },
]

const pricingPlans: PricingPlan[] = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    description: 'Parfait pour les étudiants individuels qui débutent.',
    features: [
      'Aperçu du tableau de bord',
      'Suivi des notes (jusqu\'à 5 modules)',
      'Suivi des absences',
      'Gestion de base des tâches',
      'Suivi de progression',
      'Support communautaire',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '49',
    period: 'par mois',
    description: 'Pour les étudiants sérieux qui veulent un contrôle académique total.',
    features: [
      'Tout ce qui est dans Gratuit',
      'Modules & notes illimités',
      'Analyses avancées & graphiques',
      'Journal de réflexion IA',
      'Gestion des retours',
      'Exportation des rapports (PDF/CSV)',
      'Support e-mail prioritaire',
    ],
    cta: 'Commencer l\'essai Pro',
    highlighted: true,
    badge: 'Le plus populaire',
  },
  {
    name: 'Institution',
    price: '599',
    period: 'par mois',
    description: 'Pour les écoles et universités gérant des cohortes d\'étudiants.',
    features: [
      'Tout ce qui est dans Pro',
      'Tableaux de bord multi-étudiants',
      'Panneau d\'administration & gestion des rôles',
      'Import/export de données en masse',
      'Personnalisation de la marque',
      'Accès API',
      'Gestionnaire de compte dédié',
      'Garantie SLA',
    ],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

const features = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
    title: 'Tableau de bord intelligent',
    description: 'Obtenez un aperçu en temps réel de vos performances académiques avec de magnifiques graphiques et des indicateurs clés en un coup d\'œil.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: 'Suivi des notes',
    description: 'Suivez chaque note de tous vos modules. Visualisez les tendances et prédisez votre moyenne semestrielle instantanément.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    title: 'Suivi des absences',
    description: 'Ne perdez jamais de vue votre assiduité. Recevez des alertes lorsque vous approchez de la limite d\'absences pour n\'importe quel module.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    title: 'Gestion des tâches',
    description: 'Organisez vos devoirs, vos échéances et vos objectifs d\'étude personnels avec un système intelligent de gestion des tâches.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Analyses de progression',
    description: 'Plongez au cœur de votre parcours académique avec des analyses détaillées, des tendances de performance et des informations exploitables.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/></svg>,
    title: 'Journal de réflexion',
    description: 'Capturez vos réflexions personnelles, fixez-vous des objectifs et suivez votre évolution au-delà des notes grâce à une journalisation structurée.',
  },
]

// ─── Hook: Intersection Observer ──────────────────────────────────────────────

function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold })
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
      <div className="lp-nav__inner">
        <button className="lp-nav__logo" onClick={() => scrollTo('hero')}>
          <img src={logoLight} alt="EduTrack" className="lp-nav__logo-img" />
        </button>
        <div className={`lp-nav__links ${menuOpen ? 'lp-nav__links--open' : ''}`}>
          {[
            { label: 'Fonctionnalités', id: 'features' },
            { label: 'Tarification', id: 'pricing' },
            { label: 'Équipe', id: 'team' },
            { label: 'Contact', id: 'contact' },
          ].map(({ label, id }) => (
            <button key={id} className="lp-nav__link" onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="lp-nav__actions">
          <Link to="/login" className="lp-btn lp-btn--primary" id="nav-signup-btn">Commencer</Link>
          <button className="lp-nav__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="hero" className="lp-hero">
      <div className="lp-hero__bg-orb lp-hero__bg-orb--1" />
      <div className="lp-hero__bg-orb lp-hero__bg-orb--2" />
      <div className="lp-hero__bg-orb lp-hero__bg-orb--3" />

      <div className="lp-hero__content">
        <div className="lp-hero__badge">
          <span className="lp-hero__badge-dot" />
          Conçu pour les étudiants de l'EMSI — maintenant pour tous
        </div>
        <h1 className="lp-hero__title">
          Votre parcours académique,<br />
          <span className="lp-hero__title-accent">Entièrement suivi</span>
        </h1>
        <p className="lp-hero__subtitle">
          EduTrack est le tableau de bord étudiant tout-en-un qui transforme la façon dont vous suivez vos notes, votre assiduité, vos tâches et votre développement personnel — pour que vous puissiez vous concentrer sur l'essentiel : devenir la meilleure version de vous-même.
        </p>
        <div className="lp-hero__cta-group">
          <Link to="/login" className="lp-btn lp-btn--primary lp-btn--lg" id="hero-get-started-btn">
            Commencer le suivi gratuitement
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <button className="lp-btn lp-btn--ghost lp-btn--lg" id="hero-learn-more-btn" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Voir les fonctionnalités
          </button>
        </div>
        <div className="lp-hero__stats">
          {[
            { value: '10+', label: 'Fonctionnalités' },
            { value: '3', label: 'Développeurs' },
            { value: '100%', label: 'Suivi ouvert' },
          ].map(({ value, label }) => (
            <div key={label} className="lp-hero__stat">
              <span className="lp-hero__stat-value">{value}</span>
              <span className="lp-hero__stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-hero__visual">
        <div className="lp-hero__mockup">
          <div className="lp-hero__mockup-bar">
            <span /><span /><span />
          </div>
          <div className="lp-hero__mockup-body">
            <div className="lp-hero__mockup-sidebar">
              {['Tableau de bord', 'Notes', 'Absences', 'Tâches', 'Analytics', 'Progression'].map(item => (
                <div key={item} className={`lp-hero__mockup-nav-item ${item === 'Tableau de bord' ? 'active' : ''}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="lp-hero__mockup-main">
              <div className="lp-hero__mockup-greeting">Bon retour 👋</div>
              <div className="lp-hero__mockup-cards">
                {[
                  { label: 'Moyenne', value: '15.4', trend: '↑', color: '#065f46' },
                  { label: 'Absences', value: '2/10', trend: '✓', color: '#0e7490' },
                  { label: 'Tâches terminées', value: '8/12', trend: '→', color: '#7c3aed' },
                ].map(({ label, value, trend, color }) => (
                  <div key={label} className="lp-hero__mockup-card" style={{ borderTopColor: color }}>
                    <span className="lp-hero__mockup-card-label">{label}</span>
                    <span className="lp-hero__mockup-card-value" style={{ color }}>{value}</span>
                    <span className="lp-hero__mockup-card-trend">{trend}</span>
                  </div>
                ))}
              </div>
              <div className="lp-hero__mockup-chart">
                {[60, 75, 65, 80, 70, 85, 78].map((h, i) => (
                  <div key={i} className="lp-hero__mockup-bar-item" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const { ref, visible } = useVisible()
  return (
    <section id="features" ref={ref} className={`lp-section lp-features ${visible ? 'lp-animate-in' : ''}`}>
      <div className="lp-container">
        <div className="lp-section__header">
          <span className="lp-section__label">Capacités</span>
          <h2 className="lp-section__title">Tout ce dont vous avez besoin pour exceller</h2>
          <p className="lp-section__subtitle">
            Du suivi des notes à la réflexion personnelle, EduTrack couvre chaque dimension de votre vie académique.
          </p>
        </div>
        <div className="lp-features__grid">
          {features.map((f, i) => (
            <div key={f.title} className="lp-feature-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="lp-feature-card__icon">{f.icon}</div>
              <h3 className="lp-feature-card__title">{f.title}</h3>
              <p className="lp-feature-card__desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const { ref, visible } = useVisible()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" ref={ref} className={`lp-section lp-pricing ${visible ? 'lp-animate-in' : ''}`}>
      <div className="lp-container">
        <div className="lp-section__header">
          <span className="lp-section__label">Tarification</span>
          <h2 className="lp-section__title">Tarification simple et transparente</h2>
          <p className="lp-section__subtitle">
            Choisissez le plan qui correspond à votre parcours. Changez d'offre à tout moment.
          </p>
          <div className="lp-pricing__toggle">
            <button
              id="billing-monthly-btn"
              className={`lp-pricing__toggle-btn ${billing === 'monthly' ? 'active' : ''}`}
              onClick={() => setBilling('monthly')}
            >Mensuel</button>
            <button
              id="billing-yearly-btn"
              className={`lp-pricing__toggle-btn ${billing === 'yearly' ? 'active' : ''}`}
              onClick={() => setBilling('yearly')}
            >Annuel <span className="lp-pricing__save-badge">Économisez 20%</span></button>
          </div>
        </div>

        <div className="lp-pricing__grid">
          {pricingPlans.map((plan, i) => (
            <div key={plan.name} className={`lp-pricing-card ${plan.highlighted ? 'lp-pricing-card--highlighted' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
              {plan.badge && <div className="lp-pricing-card__badge">{plan.badge}</div>}
              <div className="lp-pricing-card__header">
                <h3 className="lp-pricing-card__name">{plan.name}</h3>
                <div className="lp-pricing-card__price">
                  <span className="lp-pricing-card__currency">MAD</span>
                  <span className="lp-pricing-card__amount">
                    {plan.price === '0' ? '0' : billing === 'yearly' ? Math.round(parseInt(plan.price) * 12 * 0.8) : plan.price}
                  </span>
                  <span className="lp-pricing-card__period">
                    {plan.price === '0' ? '/toujours' : billing === 'yearly' ? '/an' : '/mois'}
                  </span>
                </div>
                <p className="lp-pricing-card__desc">{plan.description}</p>
              </div>
              <ul className="lp-pricing-card__features">
                {plan.features.map(feature => (
                  <li key={feature} className="lp-pricing-card__feature">
                    <svg className="lp-pricing-card__check" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill={plan.highlighted ? 'rgba(255,255,255,0.2)' : '#dcfce7'} />
                      <path d="M5 8l2 2 4-4" stroke={plan.highlighted ? '#fff' : '#065f46'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                id={`pricing-cta-${plan.name.toLowerCase()}`}
                className={`lp-btn lp-btn--full ${plan.highlighted ? 'lp-btn--white' : 'lp-btn--primary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function Team() {
  const { ref, visible } = useVisible()

  return (
    <section id="team" ref={ref} className={`lp-section lp-team ${visible ? 'lp-animate-in' : ''}`}>
      <div className="lp-container">
        <div className="lp-section__header">
          <span className="lp-section__label">Les Créateurs</span>
          <h2 className="lp-section__title">Rencontrez l'équipe</h2>
          <p className="lp-section__subtitle">
            Trois étudiants en ingénierie informatique de l'EMSI qui ont transformé une idée de classe en une plateforme académique complète.
          </p>
        </div>
        <div className="lp-team__grid">
          {teamMembers.map((member, i) => (
            <div key={member.name} className="lp-team-card" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="lp-team-card__avatar-wrap">
                <div className="lp-team-card__initials-badge" style={{ background: member.color, borderColor: member.color }}>
                  {member.initials}
                </div>
              </div>
              <div className="lp-team-card__info">
                <h3 className="lp-team-card__name">{member.name}</h3>
                <span className="lp-team-card__role" style={{ color: member.color }}>{member.role}</span>
                <p className="lp-team-card__bio">{member.bio}</p>
              </div>
              <div className="lp-team-card__contacts">
                <a href={`tel:${member.phone.replace(/\s/g, '')}`} id={`team-phone-${i}`} className="lp-team-card__contact-item">
                  <span className="lp-team-card__contact-icon">📞</span>
                  <span>{member.phone}</span>
                </a>
                <a href={`mailto:${member.email}`} id={`team-email-${i}`} className="lp-team-card__contact-item">
                  <span className="lp-team-card__contact-icon">✉️</span>
                  <span>{member.email}</span>
                </a>
              </div>
              <div className="lp-team-card__socials">
                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noreferrer"
                  id={`team-github-${i}`}
                  className="lp-team-card__social-btn"
                  title="GitHub"
                  style={{ '--accent': member.color } as React.CSSProperties}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href={`https://linkedin.com/in/${member.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  id={`team-linkedin-${i}`}
                  className="lp-team-card__social-btn lp-team-card__social-btn--linkedin"
                  title="LinkedIn"
                  style={{ '--accent': member.color } as React.CSSProperties}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  const { ref, visible } = useVisible()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1500)
  }

  return (
    <section id="contact" ref={ref} className={`lp-section lp-contact ${visible ? 'lp-animate-in' : ''}`}>
      <div className="lp-container">
        <div className="lp-section__header">
          <span className="lp-section__label">Entrez en contact</span>
          <h2 className="lp-section__title">Parlez à l'équipe</h2>
          <p className="lp-section__subtitle">
            Vous avez une question, un retour ou une proposition de partenariat ? Nous serions ravis d'échanger avec vous.
          </p>
        </div>

        <div className="lp-contact__layout">
          <div className="lp-contact__info">
            <div className="lp-contact__info-card">
              <h3 className="lp-contact__info-title">Coordonnées</h3>
              <p className="lp-contact__info-desc">
                Contactez directement n'importe quel membre de l'équipe, ou utilisez le formulaire et nous acheminerons votre message à la bonne personne.
              </p>
              <div className="lp-contact__info-items">
                {teamMembers.map((m, i) => (
                  <div key={i} className="lp-contact__info-member">
                    <div className="lp-contact__info-member-avatar" style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div>
                      <div className="lp-contact__info-member-name">{m.name}</div>
                      <a href={`mailto:${m.email}`} className="lp-contact__info-member-email">{m.email}</a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-contact__social-row">
                <a href="https://github.com/AbdessamadAb04/Student-tracker" target="_blank" rel="noreferrer" id="contact-github-repo" className="lp-contact__social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  Voir sur GitHub
                </a>
              </div>
            </div>
          </div>

          <form className="lp-contact__form" onSubmit={handleSubmit}>
            {sent ? (
              <div className="lp-contact__success">
                <div className="lp-contact__success-icon">✓</div>
                <h3>Message envoyé !</h3>
                <p>Merci de nous avoir contactés. Nous vous répondrons sous 24 heures.</p>
                <button type="button" className="lp-btn lp-btn--primary" onClick={() => setSent(false)}>
                  Envoyer un autre
                </button>
              </div>
            ) : (
              <>
                <div className="lp-contact__form-row">
                  <div className="lp-contact__field">
                    <label htmlFor="contact-name">Votre nom</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Zakaria Guennani"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lp-contact__field">
                    <label htmlFor="contact-email">Adresse e-mail</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="lp-contact__field">
                  <label htmlFor="contact-subject">Sujet</label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="De quoi s'agit-il ?"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="lp-contact__field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Dites-nous en plus..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" id="contact-submit-btn" className={`lp-btn lp-btn--primary lp-btn--full ${loading ? 'lp-btn--loading' : ''}`} disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <img src={logoLight} alt="EduTrack" className="lp-footer__logo" />
            <p>Donner aux étudiants les moyens de maîtriser leur parcours académique.</p>
          </div>
          <div className="lp-footer__links">
            <div className="lp-footer__col">
              <h4>Produit</h4>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Fonctionnalités</button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Tarification</button>
              <Link to="/login">Connexion</Link>
              <Link to="/login">Créer un compte</Link>
            </div>
            <div className="lp-footer__col">
              <h4>Équipe</h4>
              <a href="https://github.com/zakariaguennani" target="_blank" rel="noreferrer">Zakaria Guennani</a>
              <a href="https://github.com/yassinemchereg" target="_blank" rel="noreferrer">Yassine Mchereg</a>
              <a href="https://github.com/AbdessamadAb04" target="_blank" rel="noreferrer">Abdessamad Abounouh</a>
            </div>
            <div className="lp-footer__col">
              <h4>Contact</h4>
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Nous contacter</button>
              <a href="https://github.com/AbdessamadAb04/Student-tracker" target="_blank" rel="noreferrer">Dépôt GitHub</a>
            </div>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <span>© 2025 EduTrack. Construit avec ❤️ à l'EMSI.</span>
          <span>Zakaria Guennani · Yassine Mchereg · Abdessamad Abounouh</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="lp-root">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Team />
      <Contact />
      <Footer />
    </div>
  )
}
