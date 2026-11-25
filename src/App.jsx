import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Code2, Database, ExternalLink, Gamepad2, Github, GraduationCap, MapPin, Server, Sparkles, Wrench } from 'lucide-react'
import PortfolioScene from './PortfolioScene.jsx'
import Game from './Game.jsx'
import { about, education, goal, interests, moreProjects, openTo, personal, profile, projects, skills, strengths } from './data.js'

const SKILL_ICONS = { code: Code2, server: Server, database: Database, tools: Wrench }
const NAV = [['about', 'About'], ['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects'], ['contact', 'Contact']]

function Section({ id, index, label, title, children }) {
  return <section id={id} className="pf-section reveal">
    <div className="section-head">
      <span className="eyebrow"><span /> {String(index).padStart(2, '0')} / {label}</span>
      <h2>{title}</h2>
    </div>
    {children}
  </section>
}

export default function App() {
  const scroll = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [active, setActive] = useState('top')

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scroll.current = max > 0 ? window.scrollY / max : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          if (entry.target.id) setActive(entry.target.id)
        }
      })
    }, { rootMargin: '-35% 0px -55% 0px' })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    const fallback = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')), { threshold: 0.08 })
    document.querySelectorAll('.reveal').forEach(el => fallback.observe(el))
    return () => { observer.disconnect(); fallback.disconnect() }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('game-open', playing)
  }, [playing])

  return <>
    {!playing && <PortfolioScene scroll={scroll} />}
    <div className="bg-shade" aria-hidden="true" />

    <header className="pf-nav">
      <a className="brand" href="#top" aria-label="Nzabana Merci — home">
        <div className="brand-mark">M</div>
        <div><b>{profile.first} {profile.last}</b><small>FULL-STACK DEVELOPER / RW</small></div>
      </a>
      <nav aria-label="Sections">
        {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'current' : ''}>{label}</a>)}
      </nav>
      <a className="icon-button" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={17} /></a>
    </header>

    <main className="pf">
      <section id="top" className="hero">
        <div className="hero-panel">
          <div className="eyebrow"><span /> AVAILABLE FOR INTERNSHIPS &amp; FREELANCE</div>
          <h1>{profile.first}<br /><strong>{profile.last}.</strong></h1>
          <p className="hero-roles">{profile.roles.map((r, i) => <span key={r}>{i > 0 && <i>·</i>}{r}</span>)}</p>
          <p>A Rwandan developer building modern, responsive and user-friendly web applications with React, TypeScript, Node.js and modern databases. {profile.tagline}</p>
          <div className="panel-actions">
            <a className="primary-cta" href="#projects">VIEW MY WORK <span>↗</span></a>
            <button className="ghost-cta" onClick={() => setPlaying(true)}><Gamepad2 size={14} /> PLAY APEX RUN</button>
          </div>
          <div className="intro-foot">
            <div><b><MapPin size={16} /> RW</b><small>BASED IN RWANDA</small></div>
            <div><b>2026</b><small>GIHEKE TSS GRADUATE</small></div>
            <div><b>{projects.length + moreProjects.length + 1}+</b><small>PROJECTS BUILT</small></div>
          </div>
        </div>
        <a className="scroll-cue" href="#about">SCROLL <i>↓</i></a>
      </section>

      <Section id="about" index={1} label="ABOUT ME" title={<>Turning ideas into <i>working software.</i></>}>
        <div className="glass about-grid">
          <div className="about-copy">{about.map(p => <p key={p.slice(0, 24)}>{p}</p>)}</div>
          <aside>
            <h3><Sparkles size={14} /> Focus areas</h3>
            <p>Full-stack development, artificial intelligence, interactive web experiences, software engineering and modern digital product development.</p>
            <h3>Goal</h3>
            <p>{goal}</p>
          </aside>
        </div>
      </Section>

      <Section id="education" index={2} label="EDUCATION" title={<>Learning <i>the craft.</i></>}>
        <div className="timeline">
          {education.map(item => <article key={item.school} className="glass timeline-item">
            <div className="timeline-meta"><GraduationCap size={18} /><span>{item.period}</span></div>
            <h3>{item.school}{item.short && <small> ({item.short})</small>}</h3>
            <p>{item.detail}</p>
            <ul className="chip-list">{item.points.map(p => <li key={p}>{p}</li>)}</ul>
          </article>)}
        </div>
      </Section>

      <Section id="skills" index={3} label="TECHNICAL SKILLS" title={<>The <i>toolkit.</i></>}>
        <div className="skill-grid">
          {skills.map(s => {
            const Icon = SKILL_ICONS[s.icon]
            return <article key={s.group} className="glass skill-card">
              <h3><Icon size={16} /> {s.group}</h3>
              <ul className="chip-list">{s.items.map(i => <li key={i}>{i}</li>)}</ul>
            </article>
          })}
        </div>
        <div className="glass interests">
          <h3>Areas of interest</h3>
          <ul className="chip-list accent">{interests.map(i => <li key={i}>{i}</li>)}</ul>
        </div>
      </Section>

      <Section id="projects" index={4} label="PROJECTS" title={<>Things I've <i>shipped.</i></>}>
        <div className="project-grid">
          {projects.map((p, n) => <article key={p.name} className="glass project-card">
            <div className="project-top"><span className="project-num">{String(n + 1).padStart(2, '0')}</span><span className="project-kind">{p.kind}</span></div>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <ul className="chip-list small">{p.tech.map(t => <li key={t}>{t}</li>)}</ul>
            <div className="project-links">
              <a href={p.live} target="_blank" rel="noreferrer">LIVE SITE <ExternalLink size={12} /></a>
              {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">SOURCE <Github size={12} /></a>}
            </div>
          </article>)}
          <article className="glass project-card featured">
            <div className="project-top"><span className="project-num">06</span><span className="project-kind">3D browser game · this site</span></div>
            <h3>APEX RUN</h3>
            <p>The 3D highway behind this page is my own arcade racer built with React, Three.js and React Three Fiber — steering, nitro, traffic, near-miss scoring and a saved personal best.</p>
            <ul className="chip-list small"><li>React</li><li>Three.js</li><li>R3F</li><li>Vite</li></ul>
            <div className="project-links"><button onClick={() => setPlaying(true)}>PLAY NOW <Gamepad2 size={12} /></button><a href="https://github.com/nmcosta5/cargame" target="_blank" rel="noreferrer">SOURCE <Github size={12} /></a></div>
          </article>
        </div>
        <h3 className="sub-head">Additional development projects</h3>
        <div className="more-grid">
          {moreProjects.map(p => <article key={p.name} className="glass more-card"><h4>{p.name}</h4><p>{p.description}</p></article>)}
        </div>
      </Section>

      <Section id="strengths" index={5} label="STRENGTHS & OBJECTIVES" title={<>Where I'm <i>heading.</i></>}>
        <div className="three-col">
          <article className="glass list-card"><h3>Professional strengths</h3><ul>{strengths.map(s => <li key={s}>{s}</li>)}</ul></article>
          <article className="glass list-card"><h3>Open to</h3><p>I aspire to grow as a professional Full-Stack Software Developer and Software Engineer, contribute to innovative projects, and develop reliable digital solutions.</p><ul>{openTo.map(s => <li key={s}>{s}</li>)}</ul></article>
          <article className="glass list-card"><h3>Personal interests</h3><ul>{personal.map(s => <li key={s}>{s}</li>)}</ul></article>
        </div>
      </Section>

      <Section id="contact" index={6} label="ONLINE PRESENCE" title={<>Let's build <i>something.</i></>}>
        <div className="glass contact">
          <p>Looking for a motivated developer for an internship, a freelance project or an open-source collaboration? Reach out on GitHub — I'd love to hear about it.</p>
          <div className="panel-actions">
            <a className="primary-cta" href={profile.github} target="_blank" rel="noreferrer"><Github size={15} /> GITHUB / NMCOSTA5 <span>↗</span></a>
            <a className="ghost-cta" href={profile.portfolioRepo} target="_blank" rel="noreferrer">PORTFOLIO REPO <ArrowUpRight size={13} /></a>
          </div>
          <div className="hosted">
            <span className="stat-label">HOSTED PROJECTS</span>
            <ul>{projects.map(p => <li key={p.live}><a href={p.live} target="_blank" rel="noreferrer">{p.live.replace('https://', '')} <ArrowUpRight size={12} /></a></li>)}</ul>
          </div>
        </div>
      </Section>

      <footer className="pf-footer">
        <div><b>{profile.first} {profile.last}</b><span>{profile.title}</span></div>
        <span>{profile.tagline}</span>
        <span>© {new Date().getFullYear()} <i>•</i> R3F / WEBGL</span>
      </footer>
    </main>

    {playing && <Game onExit={() => setPlaying(false)} />}
  </>
}
