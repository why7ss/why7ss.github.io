import content from './data/content.json'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'
import Portfolio from './components/Portfolio.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const { profile, skills, projects } = content

  return (
    <div className="min-h-screen bg-base">
      <Header name={profile.name} />
      <main>
        <Hero profile={profile} />
        <Skills skills={skills} />
        <Portfolio projects={projects} />
      </main>
      <Footer profile={profile} />
    </div>
  )
}
