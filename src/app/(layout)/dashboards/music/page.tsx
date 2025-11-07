'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import MusicPlayer from '@src/views/Dashboards/MusicDashboard/FeaturedSongs'
import HomeSection from '@src/views/Dashboards/MusicDashboard/HomeSection'
import MonthlyTopArtists from '@src/views/Dashboards/MusicDashboard/MonthlyTopArtists'
import TopTrack from '@src/views/Dashboards/MusicDashboard/TopTrack'

const Music = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-yellow-500/15 to-green-500/15"></div>
      <div className="relative">
        <BreadCrumb title="Music" subTitle="Dashboards" />
        <div className="grid grid-cols-12 gap-x-space">
          <HomeSection />
          <TopTrack />
          <MusicPlayer />
          <MonthlyTopArtists />
        </div>
      </div>
    </>
  )
}

export default Music
