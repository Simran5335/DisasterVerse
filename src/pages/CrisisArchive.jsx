import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="demo-page" ref={ref} style={styles.newspaperSheet}>
      <div style={styles.pageInnerBorder}>
        {props.children}
      </div>
    </div>
  );
});

const CrisisArchive = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState('india'); // 'india' or 'global'
  const bookRef = useRef(null);
  const [pageNumber, setPageNumber] = useState(0);

  // 10 Indian Case Studies (Numbered 1 to 10)
  const indiaCaseStudies = [
    {
      title: "1. Gujarat Earthquake – 2001",
      subtitle: "26 January 2001 • Gujarat, especially Kutch and Bhuj",
      overview: "The Gujarat Earthquake occurred on 26 January 2001, with a magnitude of 7.7, affecting Gujarat, particularly the Kutch and Bhuj regions. It was one of India's most devastating earthquakes, causing severe ground shaking, building collapses and widespread infrastructure damage.",
      whatHappened: "The earthquake struck in the morning on Republic Day and produced extremely strong shaking across the region. Bhuj, Bhachau, Anjar and surrounding areas were severely affected. Numerous aftershocks followed, creating additional risks for survivors and rescue teams.",
      impact: "The disaster caused enormous human and economic losses. More than 20,000 people were killed and around 166,000 were injured, while nearly a million buildings were destroyed or damaged. Homes, schools, hospitals, roads, electricity networks, water systems and communication infrastructure were severely affected. Many families lost their homes and livelihoods.",
      response: "Search-and-rescue teams worked through collapsed buildings to locate survivors, while temporary medical facilities, relief camps and food and water distribution centres were established. Rescue was difficult because roads and communication networks had also been damaged. Poor construction quality and inadequate earthquake-resistant design increased the severity of the disaster.",
      lesson: "The disaster highlighted the importance of earthquake-resistant construction, proper building-code enforcement, structural safety assessments and community preparedness. The major lesson is that disaster-resistant buildings can save lives before emergency responders even arrive."
    },
    {
      title: "2. Indian Ocean Tsunami – 2004",
      subtitle: "26 December 2004 • Indian Ocean Region & Indian Coastline",
      overview: "The Indian Ocean Tsunami occurred on 26 December 2004 after a magnitude 9.1 undersea earthquake near Sumatra, Indonesia. The resulting tsunami travelled across the Indian Ocean and affected several countries, including India.",
      whatHappened: "The earthquake suddenly displaced the ocean floor, generating enormous tsunami waves. These waves reached coastal communities within hours, destroying settlements and causing widespread flooding. India's Tamil Nadu, Andaman and Nicobar Islands and other coastal regions were heavily affected.",
      impact: "More than 227,000 people were killed or reported missing across the affected region, including more than 16,000 in India. Coastal homes, fishing boats, ports, roads and businesses were destroyed. Many families lost their homes and livelihoods, while fishing and tourism communities suffered major economic losses.",
      response: "Search-and-rescue operations began immediately, followed by the establishment of relief camps and distribution of food, water and medical supplies. One major problem was the lack of an effective Indian Ocean-wide tsunami-warning system at the time. Many people also did not understand the natural warning signs of a tsunami.",
      lesson: "The disaster led to significant improvements in tsunami monitoring and warning systems around the Indian Ocean. The major lesson is that early warning, public awareness and immediate evacuation to higher ground can save thousands of lives."
    },
    {
      title: "3. Kosi Floods – 2008",
      subtitle: "August 2008 • Bihar",
      overview: "The 2008 Kosi Flood affected large parts of Bihar after a major breach in the Kosi River embankment. The event demonstrated the destructive potential of river flooding and the importance of river management.",
      whatHappened: "In August 2008, the Kosi River breached its embankment and changed its course, sending large amounts of water into areas outside its normal channel. Villages and agricultural areas were rapidly submerged, leaving many communities with little time to evacuate.",
      impact: "Around 3.3 million people were affected, while homes, agricultural land, livestock and infrastructure were damaged. Roads and bridges were disrupted, making transportation and communication difficult. Many families lost their primary sources of income.",
      response: "Large-scale evacuation and rescue operations were conducted using boats, helicopters and emergency teams. Relief camps provided food, water, shelter and medical assistance. However, the huge affected area, isolated villages and poor connectivity made rescue operations extremely challenging.",
      lesson: "The disaster demonstrated the importance of maintaining embankments, monitoring rivers, protecting flood-prone communities and developing reliable early-warning and evacuation systems. Flood management must focus on prevention and preparedness, not only rescue after flooding begins."
    },
    {
      title: "4. Uttarakhand Disaster – 2013",
      subtitle: "June 2013 • Uttarakhand (Kedarnath & Pilgrimage Routes)",
      overview: "The 2013 Uttarakhand disaster occurred after exceptionally heavy rainfall caused flash floods and landslides across the Himalayan state. The disaster particularly affected Kedarnath and several important pilgrimage routes.",
      whatHappened: "Heavy rainfall caused rivers to rise rapidly, while landslides blocked valleys and roads. The mountainous terrain intensified the effects, and thousands of tourists, pilgrims and local residents became stranded in remote areas.",
      impact: "Thousands of people were killed or reported missing, while roads, bridges, buildings, electricity networks and communication systems were severely damaged. Many communities were isolated because roads and bridges connecting them to other areas had been destroyed.",
      response: "The Indian Army, Air Force, ITBP, NDRF, state agencies and local communities conducted a massive rescue operation. Helicopters were particularly important because many roads were unusable. Difficult terrain, bad weather, blocked routes and communication failures made the operation extremely challenging.",
      lesson: "The disaster highlighted the importance of hazard-sensitive mountain development, early-warning systems, safe construction and clearly planned evacuation routes. Tourism and infrastructure development in mountain regions must consider natural hazards and carrying capacity."
    },
    {
      title: "5. Chennai Floods – 2015",
      subtitle: "November–December 2015 • Chennai, Tamil Nadu",
      overview: "The 2015 Chennai Floods were one of India's major urban flooding events. Extremely heavy rainfall during November and December caused widespread flooding across Chennai and surrounding areas.",
      whatHappened: "Heavy rainfall overwhelmed drainage systems and waterways, resulting in water entering residential, commercial and industrial areas. Urbanisation and development in flood-prone areas increased the city's vulnerability.",
      impact: "Homes, roads, businesses and public infrastructure were flooded. Electricity and communication services were disrupted, transport was severely affected and Chennai airport operations were temporarily disrupted. Many residents were stranded inside homes and buildings and required rescue.",
      response: "Government agencies, emergency teams and volunteers used boats to rescue residents and established relief camps. Citizens also played a major role by distributing food and water and using social media to coordinate rescue efforts. Limited drainage capacity and disruption of transportation made response difficult.",
      lesson: "The floods demonstrated the importance of proper urban drainage, protection of wetlands and water bodies, floodplain management and responsible urban planning. A well-planned city can significantly reduce the impact of heavy rainfall and flooding."
    },
    {
      title: "6. Kerala Floods – 2018",
      subtitle: "August 2018 • Kerala",
      overview: "The 2018 Kerala Floods were caused by exceptionally heavy monsoon rainfall and were accompanied by landslides across several parts of the state.",
      whatHappened: "Large quantities of rainfall caused rivers and reservoirs to rise, resulting in widespread flooding. Landslides affected hilly areas, while low-lying communities experienced severe inundation.",
      impact: "Large numbers of people were displaced and moved to relief camps. Homes, roads, bridges, agricultural land and businesses were damaged. Many communities temporarily lost access to electricity, transportation and communication.",
      response: "NDRF, defence forces, police, fire services and local authorities conducted rescue operations. One of the most notable features was the contribution of local communities, especially fishermen who used their boats to rescue people from flooded areas. Volunteers also helped collect and distribute food, clothing and essential supplies.",
      lesson: "The disaster demonstrated the importance of community participation, coordinated emergency response, effective warning systems and resilient infrastructure. Ordinary citizens can become an important part of disaster response when properly coordinated."
    },
    {
      title: "7. Cyclone Fani – 2019",
      subtitle: "May 2019 • Odisha",
      overview: "Cyclone Fani struck Odisha in May 2019 and demonstrated how strong preparedness and evacuation can reduce casualties during a major cyclone.",
      whatHappened: "The cyclone intensified over the Bay of Bengal before making landfall near Odisha. Strong winds, heavy rainfall and storm surge affected coastal communities and caused extensive infrastructure damage.",
      impact: "Homes, electricity poles, communication systems, roads, trees and agricultural areas were damaged. Despite the severe physical damage, the number of deaths was significantly reduced through large-scale pre-landfall evacuation.",
      response: "More than 1.47 million people were evacuated to safer locations before the cyclone reached the coast. NDRF and other emergency teams subsequently cleared roads, removed fallen trees and poles and helped restore access to affected communities.",
      lesson: "The major success of Fani was the combination of accurate forecasting, early warnings, evacuation planning, cyclone shelters and trained response teams. A hazard cannot always be stopped, but its human impact can be reduced through timely action."
    },
    {
      title: "8. Cyclone Amphan – 2020",
      subtitle: "May 2020 • West Bengal & Odisha",
      overview: "Cyclone Amphan was a powerful cyclone that affected West Bengal and Odisha in May 2020. It caused extensive damage to homes, infrastructure, agriculture and communication networks.",
      whatHappened: "The cyclone intensified over the Bay of Bengal before reaching eastern India. Powerful winds, heavy rainfall and storm surge affected coastal and inland areas.",
      impact: "Trees and electricity poles were uprooted, houses were damaged and large areas lost electricity and communication services. Agriculture and livelihoods were also severely affected.",
      response: "Large-scale evacuation was conducted before landfall. NDRF records more than 8.13 lakh people evacuated in West Bengal and over 2.37 lakh in Odisha. Emergency teams subsequently cleared roads, removed trees and poles and supported restoration operations.",
      lesson: "Although evacuation saved lives, infrastructure damage made recovery difficult. Restoring electricity, roads and communications became a major challenge. Disaster preparedness should include both evacuation and the resilience of essential infrastructure."
    },
    {
      title: "9. Sikkim GLOF – 2023",
      subtitle: "4 October 2023 • Sikkim (South Lhonak Lake)",
      overview: "The 2023 South Lhonak Glacial Lake Outburst Flood (GLOF) was a major high-altitude disaster in Sikkim. It demonstrated the risks associated with rapidly changing Himalayan environments.",
      whatHappened: "South Lhonak Lake breached on 4 October 2023, releasing a large volume of water into the Teesta River system. The sudden release produced a powerful downstream flood.",
      impact: "Bridges, roads, settlements and hydropower infrastructure were severely affected. Communities along the Teesta basin experienced flooding, while transportation and communication systems were disrupted.",
      response: "Search-and-rescue operations, evacuation and relief activities were carried out by government agencies and emergency teams. The mountainous terrain, damaged infrastructure and rapid movement of floodwater made response difficult.",
      lesson: "The event demonstrated the importance of monitoring glacial lakes, identifying vulnerable downstream areas and developing early-warning systems. Emerging climate-sensitive hazards require continuous scientific monitoring and risk mapping."
    },
    {
      title: "10. Wayanad Landslides – 2024",
      subtitle: "30 July 2024 • Meppadi, Wayanad, Kerala",
      overview: "The Wayanad landslides occurred on 30 July 2024 in the Meppadi region of Kerala after intense rainfall. The disaster severely affected several settlements.",
      whatHappened: "Heavy rainfall triggered landslides and debris flows that moved rapidly through hilly areas. Settlements located along vulnerable slopes and valleys were severely affected.",
      impact: "Hundreds of people were killed or injured, homes were destroyed or buried and many families were displaced. Roads, bridges and communication networks were also damaged, making rescue operations difficult.",
      response: "NDRF, state disaster-response teams, police, fire services and local volunteers participated in search-and-rescue operations. Relief camps were established for survivors, while government agencies conducted damage assessments and recovery planning.",
      lesson: "The disaster highlighted the importance of rainfall monitoring, landslide-risk mapping, responsible land-use planning, safe settlement locations and timely evacuation. Identifying high-risk areas before a disaster occurs is one of the most effective ways to reduce casualties."
    }
  ];

  // 10 Global Case Studies (Numbered 1 to 10)
  const globalCaseStudies = [
    {
      title: "1. Indian Ocean Tsunami – 2004",
      subtitle: "26 December 2004 • Indian Ocean Region",
      overview: "The 2004 Indian Ocean Tsunami was one of the deadliest natural disasters in modern history. It affected countries across the Indian Ocean, including Indonesia, Sri Lanka, India, Thailand and the Maldives.",
      whatHappened: "A magnitude 9.1 earthquake near Sumatra caused a massive displacement of seawater. Tsunami waves travelled across the ocean and struck coastal communities.",
      impact: "More than 227,000 people were killed or reported missing. Coastal villages, fishing communities, tourism facilities, roads and ports were destroyed. Millions of people were affected directly or indirectly.",
      response: "International humanitarian organisations provided food, water, medical assistance, temporary housing and financial support. Large-scale reconstruction programmes were initiated.",
      lesson: "The disaster highlighted the importance of international cooperation, tsunami-warning systems, coastal evacuation routes and public awareness. Disasters that cross national boundaries require coordinated regional preparedness."
    },
    {
      title: "2. Hurricane Katrina – 2005",
      subtitle: "August 2005 • USA (Louisiana & New Orleans)",
      overview: "Hurricane Katrina struck the United States in August 2005 and became particularly devastating because of catastrophic flooding around New Orleans.",
      whatHappened: "The hurricane strengthened over the Gulf of Mexico before making landfall. Storm surge and failures in parts of the flood-protection system caused large areas of New Orleans to flood.",
      impact: "Approximately 1,833 people died and economic losses reached over $100 billion. Homes, roads, electricity systems and public infrastructure suffered extensive damage. Large numbers of residents were displaced.",
      response: "Evacuation, emergency shelters, rescue boats, helicopters and federal assistance were used. However, the scale of the disaster overwhelmed many emergency systems.",
      lesson: "Katrina showed that disaster preparedness must consider social vulnerability as well as physical hazards. Emergency plans need to protect people who cannot evacuate independently."
    },
    {
      title: "3. Cyclone Nargis – 2008",
      subtitle: "May 2008 • Myanmar (Irrawaddy Delta)",
      overview: "Cyclone Nargis struck Myanmar in May 2008 and severely affected the densely populated Irrawaddy Delta.",
      whatHappened: "The cyclone produced powerful winds and a destructive storm surge that moved across low-lying coastal communities.",
      impact: "Approximately 138,000 people were killed or reported missing. Villages were destroyed, agricultural land was flooded and millions of people were affected.",
      response: "Local communities immediately helped survivors. Humanitarian organisations later provided food, water, medicine and emergency shelter.",
      lesson: "The disaster demonstrated that warning systems must be understandable, accessible and connected to practical evacuation plans. A warning is useful only when people can act on it."
    },
    {
      title: "4. Sichuan Earthquake – 2008",
      subtitle: "12 May 2008 • Sichuan, China",
      overview: "The Sichuan Earthquake struck China on 12 May 2008 with a magnitude of 7.9 and caused widespread destruction.",
      whatHappened: "The earthquake generated intense ground shaking and triggered thousands of landslides in mountainous regions.",
      impact: "Approximately 87,000 people were killed or went missing. Homes, schools, hospitals, roads and bridges were damaged or destroyed. Landslides blocked roads and isolated communities, making rescue difficult.",
      response: "Large-scale search-and-rescue operations were conducted, followed by medical assistance, temporary shelter and long-term reconstruction.",
      lesson: "The disaster demonstrated the importance of earthquake-resistant buildings and planning for secondary hazards like landslides. Preparedness must consider what happens after the initial disaster."
    },
    {
      title: "5. Haiti Earthquake – 2010",
      subtitle: "12 January 2010 • Port-au-Prince, Haiti",
      overview: "The Haiti Earthquake occurred on 12 January 2010 and had a magnitude of 7.0. It severely affected Port-au-Prince and surrounding areas.",
      whatHappened: "A shallow earthquake struck near a densely populated region where many buildings were not designed to withstand strong earthquake shaking.",
      impact: "Around 300,000 people were estimated to have died and more than a million people were displaced. Homes, hospitals, schools and government buildings were heavily damaged due to poor construction and limited building standard enforcement.",
      response: "International search-and-rescue teams, medical organisations and humanitarian agencies provided assistance. Temporary camps were established for displaced people while damaged infrastructure complicated response efforts.",
      lesson: "The Haiti earthquake demonstrated that vulnerability can be as important as hazard intensity. Stronger construction and better urban planning could significantly reduce future losses."
    },
    {
      title: "6. Japan Earthquake & Tsunami – 2011",
      subtitle: "11 March 2011 • Northeastern Japan",
      overview: "On 11 March 2011, a magnitude 9.0 earthquake struck offshore northeastern Japan. It triggered a massive tsunami and subsequently contributed to the Fukushima nuclear emergency.",
      whatHappened: "The earthquake caused severe shaking, followed by tsunami waves that inundated coastal areas. The tsunami damaged the Fukushima Daiichi nuclear facility, leading to a major technological emergency.",
      impact: "Thousands of people died or went missing. Coastal towns, roads, railways, power systems and other infrastructure were severely damaged.",
      response: "Japan activated its earthquake-warning systems, evacuation procedures, search-and-rescue teams, emergency shelters and medical services, alongside nuclear emergency procedures.",
      lesson: "The event showed that even highly prepared countries must plan for cascading disasters, where one hazard triggers another."
    },
    {
      title: "7. Typhoon Haiyan – 2013",
      subtitle: "November 2013 • Philippines",
      overview: "Typhoon Haiyan struck the Philippines in November 2013 and became one of the strongest tropical cyclones to make landfall.",
      whatHappened: "The typhoon produced extremely strong winds and a powerful storm surge that devastated coastal communities.",
      impact: "Thousands of people died, millions were affected and large numbers were displaced. Homes, schools, roads, communication systems and businesses were destroyed.",
      response: "Evacuation centres were opened, search-and-rescue operations were conducted and international organisations provided food, water, medical assistance and shelter.",
      lesson: "Coastal communities need to understand storm surge and evacuate before dangerous conditions begin."
    },
    {
      title: "8. Australian Bushfires – 2019–2020",
      subtitle: "2019–2020 • Australia (Black Summer)",
      overview: "The Black Summer bushfires were an exceptionally severe wildfire season across Australia.",
      whatHappened: "A combination of extreme heat, dry conditions and vegetation created conditions favourable for widespread fires.",
      impact: "More than 24 million hectares burned according to Australia's official UNDRR statement. Communities were evacuated, homes were destroyed and ecosystems and wildlife suffered enormous losses.",
      response: "Firefighters from different Australian states worked together. Evacuations were conducted, emergency shelters were opened and international firefighting assistance was provided.",
      lesson: "The disaster highlighted the importance of fire-risk monitoring, vegetation management, evacuation planning, emergency communication and community preparedness."
    },
    {
      title: "9. Türkiye–Syria Earthquakes – 2023",
      subtitle: "6 February 2023 • Southern Türkiye & Northern Syria",
      overview: "On 6 February 2023, powerful earthquakes struck southern Türkiye and northern Syria. The main earthquake had a magnitude of 7.8, followed by another major 7.5 earthquake.",
      whatHappened: "The earthquakes caused intense shaking across a densely populated region. Numerous aftershocks followed, creating additional danger for damaged structures and rescuers.",
      impact: "More than 57,000 deaths were reported by the end of March 2023. Millions of people were affected, while homes, hospitals, roads and other infrastructure suffered extensive damage due to older and vulnerable buildings.",
      response: "Local emergency teams immediately began rescue operations, followed by international search-and-rescue teams. Temporary shelters, medical services and humanitarian assistance were provided amidst cold winter conditions.",
      lesson: "Building standards must not only exist on paper; they must be properly implemented, inspected and enforced."
    },
    {
      title: "10. Myanmar Earthquake – 2025",
      subtitle: "28 March 2025 • Myanmar (Mandalay & Sagaing)",
      overview: "The Myanmar Earthquake occurred on 28 March 2025 with a magnitude of 7.7, affecting central Myanmar, particularly areas around Mandalay and Sagaing.",
      whatHappened: "The shallow earthquake produced extremely strong ground shaking. USGS recorded a maximum intensity of X and extensive infrastructure impacts.",
      impact: "USGS reported at least 3,791 deaths, 5,106 injuries and 88 missing people. The earthquake damaged or destroyed approximately 55,000 homes, 2,500 schools and 640 hospitals, along with hundreds of roads and bridges, disrupting power and water services.",
      response: "Search-and-rescue teams, medical workers and humanitarian organisations provided assistance. Emergency teams also worked to assess structural damage and restore critical infrastructure.",
      lesson: "The disaster highlights the importance of resilient critical infrastructure, rapid damage assessment, emergency medical capacity and earthquake-resistant construction."
    }
  ];

  const currentArticles = region === 'india' ? indiaCaseStudies : globalCaseStudies;

  const firstButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(0);
    }
  };

  const prevButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const nextButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const lastButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(currentArticles.length + 1);
    }
  };

  const onPageChange = (e) => {
    setPageNumber(e.data);
  };

  return (
    <div style={styles.container}>
      
      {/* Global CSS Injector */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=UnifrakturMaguntia&display=swap');
        .stf__wrapper {
          background-color: transparent !important;
        }
        .stf__item {
          background-color: #f5edd6 !important;
        }
      `}</style>

      {/* Top Header Controls */}
      <div style={styles.headerBar}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
        <h1 style={styles.mainTitle}>📚 Crisis Archive (Historical Case Studies)</h1>
        
        {/* Edition Selector Toggle */}
        <div style={styles.toggleContainer}>
          <button 
            style={{ ...styles.toggleBtn, backgroundColor: region === 'india' ? '#000000' : '#2b221e', color: '#fff' }}
            onClick={() => { setRegion('india'); setPageNumber(0); }}
          >
            🇮🇳 India Edition
          </button>
          <button 
            style={{ ...styles.toggleBtn, backgroundColor: region === 'global' ? '#000000' : '#2b221e', color: '#fff' }}
            onClick={() => { setRegion('global'); setPageNumber(0); }}
          >
            🌍 Global Edition
          </button>
        </div>
      </div>

      {/* Book Container */}
      <div style={styles.bookWrapper}>
        <HTMLFlipBook
          width={450}
          height={610}
          size="fixed"
          minWidth={350}
          maxWidth={500}
          minHeight={450}
          maxHeight={650}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          drawShadow={true}
          flippingTime={600}
          usePortrait={false}
          startPage={0}
          ref={bookRef}
          onFlip={onPageChange}
          style={styles.flipBook}
        >
          {/* FRONT COVER (Page 0) */}
          <Page>
            <div style={styles.coverPage}>
              <div style={styles.newspaperHeaderTop}>
                <span>ESTABLISHED 2026</span>
                <span>THE DISASTERVERSE CHRONICLE</span>
                <span>VOL. XXIV NO. 108</span>
              </div>
              
              {/* Masthead with DisasterVerse Times stacked word by word */}
              <div style={styles.masthead}>
                <h1 style={styles.mastheadTitle}>
                  <span style={styles.titleWord}>The</span>
                  <span style={styles.titleWord}>DisasterVerse</span>
                  <span style={styles.titleWord}>Times</span>
                </h1>
                <p style={styles.mastheadSubtitle}>
                  {region === 'india' 
                    ? 'Official National Archive of Indian Emergency Case Studies & Disaster Audits' 
                    : 'International Records of Catastrophic Global Crises & Resilience'}
                </p>
              </div>

              <div style={styles.coverContent}>
                <div style={styles.coverBadge}>SPECIAL ARCHIVAL EDITION</div>
                <h2 style={styles.coverHeadline}>
                  {region === 'india' 
                    ? '10 Defining Indian Disasters That Shaped National Preparedness & Emergency Response Infrastructure' 
                    : '10 Major Global Crises That Rewrote International Safety Protocols & Risk Engineering'}
                </h2>
                <p style={styles.coverText}>
                  Flip through the pages of this historic vintage newspaper archive to examine verified timelines, impact assessments, emergency responses, and crucial disaster lessons.
                </p>
              </div>

              <div style={styles.newspaperFooter}>
                <span>Price: Free Digital Access</span>
                <span>Edited by DisasterVerse Intelligence</span>
              </div>
            </div>
          </Page>

          {/* ARTICLE PAGES (1 to 10) */}
          {currentArticles.map((article, index) => (
            <Page key={index}>
              <div style={styles.articlePage}>
                <div style={styles.articleHeader}>
                  <span style={styles.articleSectionTag}>SPECIAL REPORT • CASE STUDY #{index + 1}</span>
                  <span style={styles.articleDate}>{region === 'india' ? 'INDIA EDITION' : 'GLOBAL EDITION'}</span>
                </div>

                <h2 style={styles.articleTitle}>{article.title}</h2>
                <h4 style={styles.articleSubtitle}>{article.subtitle}</h4>
                <div style={styles.articleRule}></div>

                <div style={styles.articleBodyContainer}>
                  {article.overview && (
                    <div style={styles.storyBlock}>
                      <h5 style={styles.columnSubHeader}>Overview</h5>
                      <p style={styles.columnBodyText}>{article.overview}</p>
                    </div>
                  )}

                  {article.whatHappened && (
                    <div style={styles.storyBlock}>
                      <h5 style={styles.columnSubHeader}>What Happened?</h5>
                      <p style={styles.columnBodyText}>{article.whatHappened}</p>
                    </div>
                  )}

                  {article.impact && (
                    <div style={styles.storyBlock}>
                      <h5 style={styles.columnSubHeader}>Impact</h5>
                      <p style={styles.columnBodyText}>{article.impact}</p>
                    </div>
                  )}

                  {article.response && (
                    <div style={styles.storyBlock}>
                      <h5 style={styles.columnSubHeader}>Response and Challenges</h5>
                      <p style={styles.columnBodyText}>{article.response}</p>
                    </div>
                  )}
                </div>

                {article.lesson && (
                  <div style={styles.editorialBox}>
                    <strong style={styles.editorialTitle}>Lessons Learned:</strong>
                    <p style={styles.editorialText}>{article.lesson}</p>
                  </div>
                )}

                <div style={styles.articlePageNumber}>- Page {index + 1} of 10 -</div>
              </div>
            </Page>
          ))}

          {/* BACK COVER (Page 11) - CLOSED BOOK SPREAD */}
          <Page>
            <div style={styles.backCoverPage}>
              <div style={styles.newspaperHeaderTop}>
                <span>ARCHIVAL RECORD</span>
                <span>VERIFIED EDITION</span>
                <span>DOC. 2026-DV</span>
              </div>

              <div style={styles.backCoverContent}>
                <div style={styles.logoWrapper}>
                  <div style={styles.logoBoxLarge}>DV</div>
                </div>
                <h2 style={styles.backCoverTitle}>DisasterVerse Intelligence</h2>
                <p style={styles.backCoverText}>
                  Dedicated to advancing emergency preparedness, resilience engineering, and historical safety awareness across generations.
                </p>
              </div>

              {/* Red Wax / Ink Stamp Seal at bottom-right corner */}
              <div style={styles.sealWrapper}>
                <div style={styles.redSeal}>
                  <span style={styles.sealTextTop}>VERIFIED</span>
                  <span style={styles.sealTextMain}>DV</span>
                  <span style={styles.sealTextBottom}>ARCHIVE</span>
                </div>
              </div>

              <div style={styles.newspaperFooter}>
                <span>PUBLISHED DIGITALLY • 2026</span>
                <span>BACK TO COMMAND CENTER</span>
              </div>
            </div>
          </Page>
        </HTMLFlipBook>

        {/* Flipping Navigation Controls */}
        <div style={styles.navControls}>
          <button onClick={firstButtonClick} style={styles.pageNavBtn}>⏮ First Page</button>
          <button onClick={prevButtonClick} style={styles.pageNavBtn}>◀ Previous Page</button>
          <span style={styles.pageIndicator}>Page {pageNumber} of {currentArticles.length + 1}</span>
          <button onClick={nextButtonClick} style={styles.pageNavBtn}>Next Page ▶</button>
          <button onClick={lastButtonClick} style={styles.pageNavBtn}>Last Page ⏭</button>
        </div>

      </div>

    </div>
  );
};

// Styles updated to remove DV badge and stack each word of the title on separate lines and centered
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f0d0c',
    color: '#fff',
    fontFamily: '"Times New Roman", Times, serif',
    boxSizing: 'border-box',
    overflow: 'hidden',
    padding: '8px 20px',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    borderBottom: '2px solid #222',
    paddingBottom: '6px',
  },
  backBtn: {
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #444',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: '16px',
    margin: 0,
    color: '#fff',
    fontFamily: 'sans-serif',
  },
  toggleContainer: {
    display: 'flex',
    gap: '6px',
  },
  toggleBtn: {
    border: '1px solid #444',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '11px',
    fontFamily: 'sans-serif',
  },
  bookWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: '5px',
  },
  flipBook: {
    boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
    margin: '0 auto',
  },
  newspaperSheet: {
    backgroundColor: '#f5edd6',
    color: '#000',
    boxSizing: 'border-box',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'inset 0 0 25px rgba(0,0,0,0.08)',
  },
  pageInnerBorder: {
    boxSizing: 'border-box',
    height: '100%',
    padding: '1.2cm 1.4cm',
    border: '2px solid #000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  },
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  backCoverPage: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    textAlign: 'center',
    position: 'relative',
  },
  backCoverContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 10px',
    gap: '10px',
  },
  logoBoxLarge: {
    width: '45px',
    height: '45px',
    backgroundColor: '#000',
    color: '#f5edd6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cinzel", serif',
    fontWeight: '900',
    fontSize: '20px',
    letterSpacing: '2px',
    borderRadius: '6px',
    margin: '0 auto',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  backCoverTitle: {
    fontSize: '16px',
    fontFamily: '"Georgia", serif',
    fontWeight: 'bold',
    color: '#000',
    margin: 0,
  },
  backCoverText: {
    fontSize: '10.5px',
    lineHeight: '1.4',
    color: '#222',
    maxWidth: '240px',
    margin: '0 auto',
  },
  sealWrapper: {
    position: 'absolute',
    bottom: '1.2cm',
    right: '1.2cm',
    zIndex: 10,
  },
  redSeal: {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    border: '2px double #881337',
    backgroundColor: 'rgba(153, 27, 27, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#881337',
    fontFamily: '"Cinzel", serif',
    boxShadow: '0 3px 8px rgba(136, 19, 55, 0.25)',
    transform: 'rotate(-12deg)',
  },
  sealTextTop: {
    fontSize: '6.5px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  sealTextMain: {
    fontSize: '13px',
    fontWeight: '900',
    lineHeight: '1',
  },
  sealTextBottom: {
    fontSize: '6.5px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  newspaperHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8.5px',
    borderBottom: '1px solid #000',
    borderTop: '1px solid #000',
    padding: '2px 0',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000',
  },
  masthead: {
    margin: '2px 0',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px',
  },
  logoBox: {
    width: '28px',
    height: '28px',
    backgroundColor: '#000',
    color: '#f5edd6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cinzel", serif',
    fontWeight: '900',
    fontSize: '13px',
    letterSpacing: '1px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  mastheadTitle: {
    display: 'flex',
    flexDirection: 'column', // Stacks each word vertically
    alignItems: 'center',    // Centers each word horizontally
    fontSize: '36px',        // Increased size
    fontWeight: 'normal',
    margin: '0 0 4px 0',
    fontFamily: '"UnifrakturMaguntia", cursive, serif',
    letterSpacing: '1px',
    color: '#000',
    lineHeight: '1.1',
  },
  titleWord: {
    display: 'block',
  },
  mastheadSubtitle: {
    fontSize: '9px',
    fontStyle: 'italic',
    margin: '4px 0 0 0',
    color: '#333',
  },
  coverContent: {
    padding: '6px 0',
    borderTop: '2px double #000',
    borderBottom: '2px double #000',
    margin: '4px 0',
  },
  coverBadge: {
    backgroundColor: '#000',
    color: '#fff',
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '8.5px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    marginBottom: '3px',
    letterSpacing: '1px',
  },
  coverHeadline: {
    fontSize: '11.5px',
    lineHeight: '1.2',
    margin: '0 0 3px 0',
    fontWeight: 'bold',
    fontFamily: '"Georgia", serif',
    color: '#000',
  },
  coverText: {
    fontSize: '9.5px',
    lineHeight: '1.3',
    maxWidth: '280px',
    margin: '0 auto',
    color: '#222',
  },
  newspaperFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8.5px',
    borderTop: '1px solid #000',
    paddingTop: '3px',
    fontStyle: 'italic',
    color: '#000',
  },
  articlePage: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  articleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8.5px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderBottom: '1px solid #000',
    paddingBottom: '2px',
    color: '#333',
  },
  articleTitle: {
    fontSize: '15px',
    margin: '2px 0 1px 0',
    fontFamily: '"Georgia", serif',
    lineHeight: '1.1',
    color: '#000',
  },
  articleSubtitle: {
    fontSize: '8.5px',
    fontStyle: 'italic',
    color: '#333',
    margin: '0 0 2px 0',
  },
  articleRule: {
    width: '100%',
    height: '2px',
    backgroundColor: '#000',
    marginBottom: '8px',
  },
  articleBodyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  storyBlock: {
    fontSize: '9px',
    lineHeight: '1.3',
  },
  columnSubHeader: {
    fontSize: '10.5px',
    fontWeight: 'bold',
    margin: '0 0 2px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#000',
    fontFamily: 'sans-serif',
  },
  columnBodyText: {
    margin: 0,
    textAlign: 'justify',
    color: '#111',
    fontSize: '9px',
    lineHeight: '1.3',
  },
  editorialBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderLeft: '3px solid #000',
    padding: '4px 6px',
    marginTop: '10px',
    marginBottom: '2px',
  },
  editorialTitle: {
    fontSize: '10px',
    color: '#000',
    display: 'block',
    marginBottom: '1px',
    fontFamily: 'sans-serif',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  editorialText: {
    margin: 0,
    fontSize: '8.5px',
    lineHeight: '1.25',
    color: '#111',
    fontStyle: 'italic',
  },
  articlePageNumber: {
    textAlign: 'center',
    fontSize: '8.5px',
    fontStyle: 'italic',
    marginTop: '2px',
    color: '#333',
  },
  navControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '5px',
  },
  pageNavBtn: {
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'sans-serif',
    transition: 'background 0.2s',
  },
  pageIndicator: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ccc',
    fontFamily: 'sans-serif',
  },
};

export default CrisisArchive;