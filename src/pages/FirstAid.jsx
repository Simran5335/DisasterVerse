import React, { useEffect, useState } from "react";
import character from "../assets/Screenshot 2026-08-17 231432.png";

const injuryData = {
  head: {
    title: "Head Bump",
    category: "Head / Temple",
    icon: "🧠",
    possible: [
      "A small bump or knock",
      "A possible concussion",
      "Feeling dizzy or unsteady",
    ],
    symptoms: [
      "Headache",
      "Dizziness",
      "Feeling confused",
      "Feeling sick",
      "Blurred vision",
      "Feeling unusually sleepy",
    ],
    firstAid: [
      "Stop playing and sit somewhere safe.",
      "Let the person rest quietly.",
      "Check that they are awake and breathing normally.",
      "Keep watching for symptoms that get worse.",
      "Get medical help if symptoms become serious.",
    ],
    application: [
      "Wrap a cold pack in a cloth.",
      "Place it gently on a small bump for a short time.",
      "Stay nearby and keep checking on the person.",
    ],
    avoid: [
      "Do not ignore worsening confusion.",
      "Do not ignore repeated vomiting.",
      "Do not let them return to sports straight away after a serious head injury.",
      "Do not move the neck if a spine injury may have happened.",
    ],
  },

  nose: {
    title: "Nosebleed",
    category: "Nose / Face",
    icon: "👃",
    possible: [
      "A small nosebleed",
      "Bleeding after a bump",
      "Irritation inside the nose",
    ],
    symptoms: [
      "Blood from the nose",
      "Blood going toward the throat",
      "Tenderness around the nose",
    ],
    firstAid: [
      "Sit up and stay calm.",
      "Lean slightly forward.",
      "Pinch the soft part of the nose.",
      "Keep holding for 10–15 minutes.",
      "If it keeps bleeding, get adult or medical help.",
    ],
    application: [
      "Use clean tissue or gauze to wipe away blood.",
      "Pinch the soft part of the nose.",
      "A wrapped cold pack can gently be placed over the nose.",
    ],
    avoid: [
      "Do not tilt the head backward.",
      "Do not put objects deep inside the nose.",
      "Do not keep releasing the nose to check.",
      "Do not blow or pick the nose immediately afterward.",
    ],
  },

  arm: {
    title: "Arm Injury",
    category: "Arm / Elbow",
    icon: "💪",
    possible: [
      "A possible fracture",
      "A small scrape",
      "An injury around the elbow",
    ],
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Trouble moving the arm",
      "A strange-looking arm",
      "Bleeding or broken skin",
    ],
    firstAid: [
      "Stop using the injured arm.",
      "Keep a possible fracture still.",
      "For a scrape, gently rinse with clean water.",
      "Cover a scrape with a clean dressing.",
      "Get medical help for a possible fracture.",
    ],
    application: [
      "Support the arm gently.",
      "Do not force it into a new position.",
      "Cover small scrapes with a clean dressing.",
      "A wrapped cold pack can help with swelling.",
    ],
    avoid: [
      "Do not straighten a deformed arm.",
      "Do not push exposed bone back.",
      "Do not keep moving the arm.",
      "Do not scrub a deep wound.",
    ],
  },

  wrist: {
    title: "Wrist Sprain",
    category: "Wrist / Hand",
    icon: "✋",
    possible: [
      "A wrist sprain",
      "A small soft-tissue injury",
      "A more serious injury",
    ],
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Less movement",
      "Tenderness",
    ],
    firstAid: [
      "Stop the activity.",
      "Rest the wrist.",
      "Remove tight rings if swelling may happen.",
      "Use a cold pack wrapped in cloth.",
      "Get help if the pain is severe.",
    ],
    application: [
      "Always wrap the cold pack in cloth.",
      "Use it for a short time.",
      "Keep the wrist comfortably supported.",
    ],
    avoid: [
      "Do not force the wrist to move.",
      "Do not put ice directly on skin.",
      "Do not keep playing if it hurts.",
      "Do not assume severe pain is only a sprain.",
    ],
  },

  knee: {
    title: "Knee Injury",
    category: "Knee / Leg",
    icon: "🦵",
    possible: [
      "A ligament injury",
      "A possible fracture",
      "A bad sprain",
    ],
    symptoms: [
      "Knee pain",
      "Swelling",
      "Trouble standing",
      "The knee feels weak",
      "Bruising",
      "A strange-looking knee",
    ],
    firstAid: [
      "Stop playing immediately.",
      "Do not put weight on the leg if it hurts.",
      "Keep the knee comfortable and still.",
      "Use a wrapped cold pack for swelling.",
      "Get medical help for a serious injury.",
    ],
    application: [
      "Wrap the cold pack in cloth.",
      "Apply it for a short time.",
      "Keep the leg comfortably supported.",
      "Minimize movement if a fracture is suspected.",
    ],
    avoid: [
      "Do not force the knee straight.",
      "Do not make someone walk on a badly injured leg.",
      "Do not move a deformed joint.",
      "Do not return to sports while there is major pain.",
    ],
  },

  ankle: {
    title: "Ankle Sprain",
    category: "Ankle / Foot",
    icon: "🦶",
    possible: [
      "An ankle sprain",
      "A soft-tissue injury",
      "A possible fracture",
    ],
    symptoms: [
      "Ankle pain",
      "Swelling",
      "Bruising",
      "Trouble walking",
      "Tenderness",
    ],
    firstAid: [
      "Stop walking if it hurts.",
      "Rest the ankle.",
      "Use a wrapped cold pack.",
      "Raise the leg when comfortable.",
      "Get help if the ankle looks badly injured.",
    ],
    application: [
      "Wrap the cold pack in a thin cloth.",
      "Apply it for short periods.",
      "Use comfortable support if available.",
    ],
    avoid: [
      "Do not put ice directly on skin.",
      "Do not force the ankle to move.",
      "Do not continue sports through pain.",
      "Do not ignore numbness or obvious deformity.",
    ],
  },
};

const hotspots = [
  {
    id: "head",
    injury: "head",
    label: "Head",
    className: "headHotspot",
  },
  {
    id: "nose",
    injury: "nose",
    label: "Nose",
    className: "noseHotspot",
  },
  {
    id: "leftArm",
    injury: "arm",
    label: "Arm",
    className: "leftArmHotspot",
  },
  {
    id: "rightArm",
    injury: "arm",
    label: "Arm",
    className: "rightArmHotspot",
  },
  {
    id: "leftWrist",
    injury: "wrist",
    label: "Wrist",
    className: "leftWristHotspot",
  },
  {
    id: "rightWrist",
    injury: "wrist",
    label: "Wrist",
    className: "rightWristHotspot",
  },
  {
    id: "leftKnee",
    injury: "knee",
    label: "Knee",
    className: "leftKneeHotspot",
  },
  {
    id: "rightKnee",
    injury: "knee",
    label: "Knee",
    className: "rightKneeHotspot",
  },
  {
    id: "leftAnkle",
    injury: "ankle",
    label: "Ankle",
    className: "leftAnkleHotspot",
  },
  {
    id: "rightAnkle",
    injury: "ankle",
    label: "Ankle",
    className: "rightAnkleHotspot",
  },
];

export default function FirstAid() {
  const [selectedInjury, setSelectedInjury] = useState(null);

  const selected = selectedInjury
    ? injuryData[selectedInjury]
    : null;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedInjury(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedInjury
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedInjury]);

  return (
    <div className="firstAidPage">

      <div className="firstAidCard">

        {/* TITLE */}
        <div className="titleBubble">

          <div className="titleEmoji">
            🩹
          </div>

          <div>
            <h1 className="firstAidHeading">
              First Aid Helper!
            </h1>

            <p className="firstAidSubheading">
              Uh-oh! Where does it hurt?
            </p>
          </div>

        </div>


        {/* INSTRUCTION */}
        <div className="instructionBubble">
          👆 Tap a little red dot to learn what to do!
        </div>


        {/* CHARACTER */}
        <div className="characterArea">

          <img
            src={character}
            alt="Interactive first aid character"
            className="characterImage"
          />

          {hotspots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              aria-label={spot.label}
              title={spot.label}
              data-tooltip={spot.label}
              className={`hotspot ${spot.className}`}
              onClick={() => setSelectedInjury(spot.injury)}
            />
          ))}

        </div>


        {/* BOTTOM TIP */}
        <div className="bottomTip">
          ⭐ Remember: Stay calm, stay safe, and ask a grown-up for help!
        </div>

      </div>


      {/* MODAL */}
      {selected && (

        <div
          className="modalOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedInjury(null);
            }
          }}
        >

          <div
            className="injuryModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="injury-title"
          >

            {/* CLOSE */}
            <button
              type="button"
              className="modalClose"
              onClick={() => setSelectedInjury(null)}
              aria-label="Close"
            >
              ×
            </button>


            {/* MODAL HEADER */}
            <div className="modalTop">

              <div className="bigInjuryIcon">
                {selected.icon}
              </div>

              <div>

                <div className="modalCategory">
                  {selected.category}
                </div>

                <h2 id="injury-title">
                  {selected.title}
                </h2>

              </div>

            </div>


            {/* POSSIBLE INJURY */}
            <div className="medicalSection">

              <h3>
                🔍 What could it be?
              </h3>

              <ul>
                {selected.possible.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </div>


            {/* SYMPTOMS */}
            <div className="medicalSection symptomsSection">

              <h3>
                👀 What might you notice?
              </h3>

              <ul>
                {selected.symptoms.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </div>


            {/* FIRST AID */}
            <div className="medicalSection firstAidSection">

              <h3>
                🩹 What should I do?
              </h3>

              <ol>

                {selected.firstAid.map((item, index) => (

                  <li key={index}>

                    <span className="stepNumber">
                      {index + 1}
                    </span>

                    <span>
                      {item}
                    </span>

                  </li>

                ))}

              </ol>

            </div>


            {/* QUICK HELP */}
            <div className="medicalSection applicationSection">

              <h3>
                💡 Quick Help
              </h3>

              <ol>

                {selected.application.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}

              </ol>

            </div>


            {/* DON'T DO */}
            <div className="medicalSection avoidSection">

              <h3>
                🚫 Don't do this!
              </h3>

              <ul>

                {selected.avoid.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}

              </ul>

            </div>


            {/* REMINDER */}
            <div className="grownUpReminder">

              👨‍👩‍👧 <strong>Important:</strong> Always tell a
              parent, teacher, or another trusted adult if someone
              is hurt.

            </div>


            {/* DONE */}
            <button
              type="button"
              className="doneButton"
              onClick={() => setSelectedInjury(null)}
            >
              Got It! 👍
            </button>

          </div>

        </div>

      )}


      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================
           PAGE
        ====================================== */

        .firstAidPage {
          width: 100%;
          height: 100vh;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 10px;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #DCEEFF 0%,
              #CBE5FA 50%,
              #DCEEFF 100%
            );

          color: #1A2530;

          font-family:
            "Nunito",
            "Trebuchet MS",
            Arial,
            sans-serif;
        }


        /* =====================================
           MAIN CARD
        ====================================== */

        .firstAidCard {
          width: min(900px, 98vw);

          height: calc(100vh - 20px);

          min-height: 0;

          display: flex;
          flex-direction: column;
          align-items: center;

          padding: 14px 18px;

          background: rgba(207, 230, 250, 0.92);

          border: 2px solid #B8D8F2;

          border-radius: 30px;

          box-shadow:
            0 18px 45px rgba(23, 105, 170, 0.16);

          position: relative;

          overflow: hidden;
        }


        /* =====================================
           TITLE
        ====================================== */

        .titleBubble {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 12px;

          margin-bottom: 8px;
        }


        .titleEmoji {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #FFFFFF;

          border-radius: 18px;

          font-size: 30px;

          box-shadow:
            0 5px 12px rgba(23, 105, 170, 0.12);
        }


        .firstAidHeading {
          margin: 0;

          color: #12466D;

          font-size: 31px;

          line-height: 1;

          font-weight: 900;

          letter-spacing: -0.5px;
        }


        .firstAidSubheading {
          margin: 7px 0 0;

          color: #35657F;

          font-size: 15px;

          font-weight: 700;
        }


        /* =====================================
           INSTRUCTION
        ====================================== */

        .instructionBubble {
          padding: 9px 17px;

          margin: 8px 0 4px;

          background: #EAF5FF;

          border: 2px solid #B8D8F2;

          border-radius: 50px;

          color: #1769AA;

          font-size: 14px;

          font-weight: 800;

          box-shadow:
            0 4px 10px rgba(23, 105, 170, 0.08);
        }


        /* =====================================
           CHARACTER AREA
        ====================================== */

        .characterArea {
          position: relative;

          /*
            Larger image area.
            The complete image, including its
            original background, expands here.
          */
          width: min(760px, 82vw);

          height: min(650px, 65vh);

          display: flex;

          align-items: center;

          justify-content: center;

          margin: 0 auto;

          overflow: visible;

          flex: 1;

          min-height: 0;
        }


        /* =====================================
           CHARACTER IMAGE
        ====================================== */

        .characterImage {
          width: 100%;

          height: 100%;

          display: block;

          /*
            Fill the expanded area while
            preserving the image background.
          */
          object-fit: fill;

          user-select: none;

          pointer-events: none;
        }


        /* =====================================
           HOTSPOTS
        ====================================== */

        .hotspot {
          position: absolute;

          width: 12px;

          height: 12px;

          padding: 0;

          border-radius: 50%;

          background: #FF4F55;

          border: 2px solid #FFFFFF;

          cursor: pointer;

          z-index: 50;

          transform:
            translate(-50%, -50%);

          box-shadow:
            0 0 0 3px rgba(255, 79, 85, 0.18),
            0 2px 8px rgba(255, 79, 85, 0.45);

          animation:
            pulseHotspot 1.8s infinite;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .hotspot:hover {
          transform:
            translate(-50%, -50%)
            scale(1.3);

          box-shadow:
            0 0 0 5px rgba(255, 79, 85, 0.18),
            0 3px 12px rgba(255, 79, 85, 0.65);
        }


        /* =====================================
           TOOLTIP
        ====================================== */

        .hotspot::after {
          content: attr(data-tooltip);

          position: absolute;

          left: 50%;

          bottom: calc(100% + 8px);

          transform: translateX(-50%);

          white-space: nowrap;

          padding: 5px 9px;

          background: #FFFFFF;

          color: #1769AA;

          border: 1px solid #B8D8F2;

          border-radius: 9px;

          font-size: 11px;

          font-weight: 800;

          opacity: 0;

          pointer-events: none;

          transition:
            opacity 0.2s ease;

          box-shadow:
            0 4px 12px rgba(23, 105, 170, 0.16);
        }


        .hotspot:hover::after {
          opacity: 1;
        }


        /* =====================================
           CORRECT DOT POSITIONS
        ====================================== */

        /* Forehead */
        .headHotspot {
          top: 27%;
          left: 50%;
        }


        /* Nose */
        .noseHotspot {
          top: 39%;
          left: 50%;
        }


        /* Left upper arm */
        .leftArmHotspot {
          top: 57%;
          left: 38%;
        }


        /* Right upper arm */
        .rightArmHotspot {
          top: 57%;
          left: 62%;
        }


        /* Left wrist / hand */
        .leftWristHotspot {
          top: 66%;
          left: 35%;
        }


        /* Right wrist / hand */
        .rightWristHotspot {
          top: 66%;
          left: 65%;
        }


        /* Left knee */
        .leftKneeHotspot {
          top: 75%;
          left: 45%;
        }


        /* Right knee */
        .rightKneeHotspot {
          top: 75%;
          left: 55%;
        }


        /* Left ankle */
        .leftAnkleHotspot {
          top: 87%;
          left: 43%;
        }


        /* Right ankle */
        .rightAnkleHotspot {
          top: 87%;
          left: 57%;
        }


        /* =====================================
           DOT ANIMATION
        ====================================== */

        @keyframes pulseHotspot {

          0% {
            box-shadow:
              0 0 0 2px rgba(255, 79, 85, 0.22),
              0 2px 7px rgba(255, 79, 85, 0.40);
          }

          50% {
            box-shadow:
              0 0 0 5px rgba(255, 79, 85, 0.05),
              0 2px 12px rgba(255, 79, 85, 0.65);
          }

          100% {
            box-shadow:
              0 0 0 2px rgba(255, 79, 85, 0.22),
              0 2px 7px rgba(255, 79, 85, 0.40);
          }

        }


        /* =====================================
           BOTTOM TIP
        ====================================== */

        .bottomTip {
          margin-top: -2px;

          padding: 8px 15px;

          border-radius: 50px;

          background: #EAF5FF;

          color: #35657F;

          border: 1px solid #B8D8F2;

          font-size: 12px;

          font-weight: 700;

          text-align: center;
        }


        /* =====================================
           MODAL OVERLAY
        ====================================== */

        .modalOverlay {
          position: fixed;

          inset: 0;

          z-index: 99999;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 16px;

          background:
            rgba(18, 70, 109, 0.48);

          backdrop-filter:
            blur(7px);

          -webkit-backdrop-filter:
            blur(7px);
        }


        /* =====================================
           MODAL
        ====================================== */

        .injuryModal {
          position: relative;

          width: min(620px, 95vw);

          max-height: 91vh;

          overflow-y: auto;

          padding: 27px;

          background: #D9ECFF;

          color: #1A2530;

          border: 2px solid #A9D2F2;

          border-radius: 24px;

          box-shadow:
            0 25px 65px rgba(18, 70, 109, 0.32);

          animation:
            modalAppear 0.22s ease-out;
        }


        @keyframes modalAppear {

          from {
            opacity: 0;

            transform:
              translateY(12px)
              scale(0.96);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =====================================
           CLOSE BUTTON
        ====================================== */

        .modalClose {
          position: absolute;

          top: 12px;

          right: 12px;

          width: 44px;

          height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          border: 2px solid #91C5EC;

          background: #B9DCFA;

          color: #12466D;

          font-size: 27px;

          font-weight: 900;

          cursor: pointer;

          transition:
            0.2s ease;
        }


        .modalClose:hover {
          background: #FF6B6B;

          color: #FFFFFF;

          border-color: #FF6B6B;

          transform: scale(1.08);
        }


        /* =====================================
           MODAL HEADER
        ====================================== */

        .modalTop {
          display: flex;

          align-items: center;

          gap: 14px;

          padding-right: 50px;

          margin-bottom: 15px;
        }


        .bigInjuryIcon {
          width: 65px;

          height: 65px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #FFFFFF;

          border-radius: 20px;

          font-size: 35px;

          box-shadow:
            0 5px 14px rgba(23, 105, 170, 0.12);
        }


        .modalCategory {
          display: inline-block;

          padding: 5px 11px;

          background: #FF6B6B;

          color: #FFFFFF;

          border-radius: 20px;

          font-size: 11px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.04em;
        }


        .injuryModal h2 {
          margin: 6px 0 0;

          color: #12466D;

          font-size: 27px;

          line-height: 1.15;

          font-weight: 900;
        }


        /* =====================================
           INFORMATION CARDS
        ====================================== */

        .medicalSection {
          margin-top: 12px;

          padding: 15px 17px;

          background: #EAF5FF;

          border-radius: 18px;

          border: 1px solid #B8D8F2;

          box-shadow:
            0 3px 10px rgba(23, 105, 170, 0.07);
        }


        .medicalSection h3 {
          margin: 0 0 9px;

          color: #1769AA;

          font-size: 16px;

          font-weight: 900;
        }


        .medicalSection ul,
        .medicalSection ol {
          margin: 0;

          padding-left: 21px;

          color: #1A2530;

          font-size: 14px;

          line-height: 1.55;

          font-weight: 600;
        }


        .medicalSection li {
          margin-bottom: 4px;
        }


        /* =====================================
           SYMPTOMS
        ====================================== */

        .symptomsSection {
          background: #EDF7FF;
        }


        /* =====================================
           FIRST AID
        ====================================== */

        .firstAidSection {
          background: #DFF2FF;

          border-color: #99CDF0;
        }


        .firstAidSection ol {
          padding-left: 0;

          list-style: none;
        }


        .firstAidSection li {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          margin-bottom: 9px;
        }


        .stepNumber {
          width: 24px;

          height: 24px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #2878C8;

          color: #FFFFFF;

          font-size: 12px;

          font-weight: 900;
        }


        /* =====================================
           QUICK HELP
        ====================================== */

        .applicationSection {
          background: #E7F5FF;

          border-color: #A5D5F3;
        }


        /* =====================================
           DON'T DO
        ====================================== */

        .avoidSection {
          background: #FFF1F1;

          border-color: #FFD0D0;
        }


        .avoidSection h3 {
          color: #F05D64;
        }


        /* =====================================
           GROWN-UP REMINDER
        ====================================== */

        .grownUpReminder {
          margin-top: 14px;

          padding: 13px 15px;

          background: #FFF7D9;

          border: 1px solid #F1D98A;

          border-radius: 16px;

          color: #6E5917;

          font-size: 13px;

          line-height: 1.45;

          text-align: center;
        }


        /* =====================================
           DONE BUTTON
        ====================================== */

        .doneButton {
          width: 100%;

          margin-top: 15px;

          padding: 14px 20px;

          border: none;

          border-radius: 16px;

          background: #2878C8;

          color: #FFFFFF;

          font-size: 17px;

          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 5px 13px rgba(40, 120, 200, 0.28);

          transition:
            0.2s ease;
        }


        .doneButton:hover {
          background: #1769AA;

          transform: translateY(-2px);
        }


        /* =====================================
           MOBILE
        ====================================== */

        @media (max-width: 700px) {

          .firstAidPage {
            width: 100vw;

            height: 100vh;

            min-height: 100vh;

            padding: 4px;

            overflow: hidden;
          }


          .firstAidCard {
            width: 100vw;

            height: 100vh;

            min-height: 0;

            padding: 10px 8px;

            border-radius: 18px;
          }


          .titleBubble {
            gap: 8px;
          }


          .titleEmoji {
            width: 45px;

            height: 45px;

            font-size: 25px;

            border-radius: 15px;
          }


          .firstAidHeading {
            font-size: 22px;
          }


          .firstAidSubheading {
            font-size: 12px;
          }


          .instructionBubble {
            font-size: 12px;

            padding: 7px 12px;
          }


          /* Larger mobile image */
          .characterArea {
            width: 96vw;

            height: 62vh;

            flex: 1;

            min-height: 0;
          }


          .characterImage {
            width: 100%;

            height: 100%;

            object-fit: fill;
          }


          /* Smaller mobile dots */
          .hotspot {
            width: 10px;

            height: 10px;

            border-width: 2px;
          }


          .hotspot::after {
            display: none;
          }


          .bottomTip {
            font-size: 10px;

            padding: 7px 10px;
          }


          .injuryModal {
            width: 96vw;

            max-height: 93vh;

            padding: 21px 15px;

            border-radius: 21px;
          }


          .modalTop {
            padding-right: 45px;

            gap: 10px;
          }


          .bigInjuryIcon {
            width: 53px;

            height: 53px;

            font-size: 28px;

            border-radius: 16px;
          }


          .injuryModal h2 {
            font-size: 22px;
          }


          .modalCategory {
            font-size: 9px;

            padding: 4px 8px;
          }


          .medicalSection {
            padding: 13px;
          }


          .medicalSection h3 {
            font-size: 15px;
          }


          .medicalSection ul,
          .medicalSection ol {
            font-size: 13px;
          }


          .modalClose {
            width: 42px;

            height: 42px;
          }

        }

      `}</style>
    </div>
  );
}