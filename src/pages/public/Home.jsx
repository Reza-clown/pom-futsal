import HeroSection from "../../components/public/HeroSection"
import LiveScoreSection from "../../components/public/LiveScoreSection"
import StandingsSection from "../../components/public/StandingsSection"
import ScheduleSection from "../../components/public/ScheduleSection"

function Home() {
  return (
    <>
      <HeroSection />
      <LiveScoreSection />
      <StandingsSection />
      <ScheduleSection />
    </>
  )
}

export default Home
