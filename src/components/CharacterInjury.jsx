import React, { useEffect, useState } from "react";
import character from "../assets/Screenshot 2026-08-17 231432.png";

/* =========================================================
   INJURY INFORMATION
========================================================= */

const injuryData = {
  head: {
    title: "Head Injury",
    category: "Head / Temple",
    symptoms: [
      "Headache",
      "Dizziness",
      "Confusion",
      "Nausea",
    ],
    firstAid: [
      "Keep the person still and calm.",
      "Check that they are breathing normally.",
      "Apply a cold pack wrapped in cloth to any swelling.",
      "Monitor the person for worsening symptoms.",
      "Seek medical help if the injury appears serious.",
    ],
    avoid: [
      "Do not shake the person.",
      "Do not give food or drink if they are confused or unconscious.",
      "Do not ignore worsening symptoms.",
      "Do not allow strenuous activity immediately after the injury.",
    ],
  },

  nose: {
    title: "Nosebleed",
    category: "Nose / Face",
    symptoms: [
      "Bleeding from the nose",
      "Blood from one or both nostrils",
      "Possible light-headedness",
    ],
    firstAid: [
      "Sit the person upright.",
      "Lean their head slightly forward.",
      "Pinch the soft part of the nose firmly.",
      "Hold pressure continuously for about 10–15 minutes.",
      "Spit out blood rather than swallowing it.",
    ],
    avoid: [
      "Do not tilt the head backward.",
      "Do not lie flat.",
      "Do not repeatedly release pressure to check the bleeding.",
      "Do not blow the nose immediately after bleeding stops.",
    ],
  },

  leftArm: {
    title: "Arm Injury",
    category: "Arm / Elbow",
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Difficulty moving the arm",
    ],
    firstAid: [
      "Stop using the injured arm.",
      "Keep the arm in a comfortable position.",
      "Support the arm if necessary.",
      "Apply a cold pack wrapped in cloth.",
      "Seek medical assessment if a fracture is suspected.",
    ],
    avoid: [
      "Do not force the arm into position.",
      "Do not massage a suspected fracture.",
      "Do not allow unnecessary movement.",
    ],
  },

  rightArm: {
    title: "Arm Injury",
    category: "Arm / Elbow",
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Difficulty moving the arm",
    ],
    firstAid: [
      "Stop using the injured arm.",
      "Keep the arm in a comfortable position.",
      "Support the arm if necessary.",
      "Apply a cold pack wrapped in cloth.",
      "Seek medical assessment if a fracture is suspected.",
    ],
    avoid: [
      "Do not force the arm into position.",
      "Do not massage a suspected fracture.",
      "Do not allow unnecessary movement.",
    ],
  },

  leftWrist: {
    title: "Wrist Injury",
    category: "Wrist / Hand",
    symptoms: [
      "Pain",
      "Swelling",
      "Tenderness",
      "Reduced movement",
    ],
    firstAid: [
      "Rest the wrist.",
      "Keep the wrist supported.",
      "Apply a cold pack wrapped in cloth for short periods.",
      "Remove rings or tight objects if swelling is developing.",
      "Get medical attention if there is severe pain or deformity.",
    ],
    avoid: [
      "Do not repeatedly move the injured wrist.",
      "Do not apply ice directly to the skin.",
      "Do not attempt to straighten a deformed wrist.",
    ],
  },

  rightWrist: {
    title: "Wrist Injury",
    category: "Wrist / Hand",
    symptoms: [
      "Pain",
      "Swelling",
      "Tenderness",
      "Reduced movement",
    ],
    firstAid: [
      "Rest the wrist.",
      "Keep the wrist supported.",
      "Apply a cold pack wrapped in cloth for short periods.",
      "Remove rings or tight objects if swelling is developing.",
      "Get medical attention if there is severe pain or deformity.",
    ],
    avoid: [
      "Do not repeatedly move the injured wrist.",
      "Do not apply ice directly to the skin.",
      "Do not attempt to straighten a deformed wrist.",
    ],
  },

  leftKnee: {
    title: "Knee / Leg Injury",
    category: "Knee / Leg",
    symptoms: [
      "Pain",
      "Swelling",
      "Difficulty walking",
      "Reduced movement",
    ],
    firstAid: [
      "Stop activity and rest the leg.",
      "Apply a cold pack wrapped in cloth.",
      "Support the leg comfortably.",
      "Elevate the leg when possible.",
      "Seek medical assessment if the injury is severe.",
    ],
    avoid: [
      "Do not continue exercising.",
      "Do not force the knee to bend.",
      "Do not massage severe swelling.",
      "Do not put unnecessary weight on a severely injured leg.",
    ],
  },

  rightKnee: {
    title: "Knee / Leg Injury",
    category: "Knee / Leg",
    symptoms: [
      "Pain",
      "Swelling",
      "Difficulty walking",
      "Reduced movement",
    ],
    firstAid: [
      "Stop activity and rest the leg.",
      "Apply a cold pack wrapped in cloth.",
      "Support the leg comfortably.",
      "Elevate the leg when possible.",
      "Seek medical assessment if the injury is severe.",
    ],
    avoid: [
      "Do not continue exercising.",
      "Do not force the knee to bend.",
      "Do not massage severe swelling.",
      "Do not put unnecessary weight on a severely injured leg.",
    ],
  },

  leftAnkle: {
    title: "Ankle / Foot Injury",
    category: "Ankle / Foot",
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Difficulty putting weight on the foot",
    ],
    firstAid: [
      "Rest the injured foot.",
      "Apply a cold pack wrapped in cloth.",
      "Elevate the foot when possible.",
      "Keep the ankle supported.",
      "Seek medical attention if severe pain or deformity is present.",
    ],
    avoid: [
      "Do not continue walking if it causes significant pain.",
      "Do not apply ice directly to the skin.",
      "Do not attempt to straighten a deformed ankle.",
    ],
  },

  rightAnkle: {
    title: "Ankle / Foot Injury",
    category: "Ankle / Foot",
    symptoms: [
      "Pain",
      "Swelling",
      "Bruising",
      "Difficulty putting weight on the foot",
    ],
    firstAid: [
      "Rest the injured foot.",
      "Apply a cold pack wrapped in cloth.",
      "Elevate the foot when possible.",
      "Keep the ankle supported.",
      "Seek medical attention if severe pain or deformity is present.",
    ],
    avoid: [
      "Do not continue walking if it causes significant pain.",
      "Do not apply ice directly to the skin.",
      "Do not attempt to straighten a deformed ankle.",
    ],
  },
};

/* =========================================================
   HOTSPOT POSITIONS
========================================================= */

const dots = [
  {
    id: "head",
    label: "Head / Temple",
    top: "26%",
    left: "50%",
  },
  {
    id: "nose",
    label: "Nose / Face",
    top: "39%",
    left: "50%",
  },
  {
    id: "leftArm",
    label: "Left Arm / Elbow",
    top: "54%",
    left: "36%",
  },
  {
    id: "rightArm",
    label: "Right Arm / Elbow",
    top: "54%",
    left: "64%",
  },
  {
    id: "leftWrist",
    label: "Left Wrist / Hand",
    top: "64%",
    left: "34%",
  },
  {
    id: "rightWrist",
    label: "Right Wrist / Hand",
    top: "64%",
    left: "66%",
  },
  {
    id: "leftKnee",
    label: "Left Knee / Leg",
    top: "72%",
    left: "44%",
  },
  {
    id: "rightKnee",
    label: "Right Knee / Leg",
    top: "72%",
    left: "56%",
  },
  {
    id: "leftAnkle",
    label: "Left Ankle / Foot",
    top: "86%",
    left: "42%",
  },
  {
    id: "rightAnkle",
    label: "Right Ankle / Foot",
    top: "86%",
    left: "58%",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function CharacterInjury() {
  const [selectedDot, setSelectedDot] = useState(null);

  /* Close modal with Escape */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedDot(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedData = selectedDot
    ? injuryData[selectedDot.id]
    : null;

  return (
    <div style={styles.wrapper}>
      {/* =====================================================
          MAIN CHARACTER CARD
      ====================================================== */}

      <div style={styles.card}>
        <h1 style={styles.heading}>
          Select an Injury Location
        </h1>

        <p style={styles.description}>
          Click a red dot on the character to view first aid
          information.
        </p>

        {/* CHARACTER */}
        <div style={styles.characterContainer}>
          <img
            src={character}
            alt="Character for selecting injury location"
            style={styles.characterImage}
          />

          {/* HOTSPOTS */}
          {dots.map((dot) => (
            <button
              key={dot.id}
              type="button"
              aria-label={`Select ${dot.label}`}
              title={dot.label}
              onClick={() => setSelectedDot(dot)}
              style={{
                ...styles.hotspot,
                top: dot.top,
                left: dot.left,
              }}
            >
              <span style={styles.hotspotInner}></span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}

      {selectedDot && selectedData && (
        <div
          style={styles.overlay}
          onClick={() => setSelectedDot(null)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelectedDot(null)}
              style={styles.closeButton}
            >
              ×
            </button>

            {/* ICON */}
            <div style={styles.modalIcon}>
              🩹
            </div>

            {/* TITLE */}
            <h2 style={styles.modalTitle}>
              {selectedData.title}
            </h2>

            {/* CATEGORY */}
            <div style={styles.category}>
              {selectedData.category}
            </div>

            {/* =================================================
                SYMPTOMS
            ================================================== */}

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>
                🩺 Common Symptoms
              </h3>

              <ul style={styles.list}>
                {selectedData.symptoms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {/* =================================================
                FIRST AID
            ================================================== */}

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>
                🩹 First Aid Required
              </h3>

              <ol style={styles.list}>
                {selectedData.firstAid.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            {/* =================================================
                WHAT TO AVOID
            ================================================== */}

            <section style={styles.avoidSection}>
              <h3 style={styles.avoidTitle}>
                ⚠️ What to Avoid
              </h3>

              <ul style={styles.avoidList}>
                {selectedData.avoid.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {/* DONE BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedDot(null)}
              style={styles.doneButton}
            >
              Got It! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  /* ---------------------------------------------------------
     MAIN PAGE
  --------------------------------------------------------- */

  wrapper: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
    background: "#F0F8FF",
    fontFamily:
      "'Nunito', 'Comic Sans MS', 'Trebuchet MS', Arial, sans-serif",
  },

  /* ---------------------------------------------------------
     MAIN CARD
  --------------------------------------------------------- */

  card: {
    width: "100%",
    minHeight: "calc(100vh - 30px)",
    borderRadius: "24px",
    border: "1px solid #D7EAF7",
    background: "#F0F8FF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 20px",
    boxSizing: "border-box",
  },

  heading: {
    margin: "0",
    color: "#1A2530",
    fontSize: "32px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "-0.5px",
  },

  description: {
    margin: "14px 0 20px",
    color: "#1A2530",
    fontSize: "17px",
    fontWeight: "500",
    textAlign: "center",
  },

  /* ---------------------------------------------------------
     CHARACTER
  --------------------------------------------------------- */

  characterContainer: {
    position: "relative",
    width: "min(600px, 80vw)",
    height: "min(680px, 72vh)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    background: "transparent",
  },

  characterImage: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "none",
    background: "transparent",
  },

  /* ---------------------------------------------------------
     RED HOTSPOTS
  --------------------------------------------------------- */

  hotspot: {
    position: "absolute",
    width: "30px",
    height: "30px",
    padding: "0",
    borderRadius: "50%",
    border: "3px solid #FFFFFF",
    background: "#FF6B6B",
    boxShadow:
      "0 0 0 5px rgba(255,107,107,0.25), 0 4px 12px rgba(26,37,48,0.25)",
    transform: "translate(-50%, -50%)",
    cursor: "pointer",
    zIndex: 20,
    animation: "pulseHotspot 1.5s infinite",
  },

  hotspotInner: {
    position: "absolute",
    inset: "5px",
    borderRadius: "50%",
    background: "#FF6B6B",
  },

  /* ---------------------------------------------------------
     DARK OVERLAY
  --------------------------------------------------------- */

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "rgba(26, 37, 48, 0.45)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  /* ---------------------------------------------------------
     WHITE MODAL
  --------------------------------------------------------- */

  modal: {
    position: "relative",
    width: "520px",
    maxWidth: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: "32px",
    borderRadius: "16px",
    border: "2px solid #D7EAF7",
    background: "#FFFFFF",
    color: "#1A2530",
    boxShadow:
      "0 20px 50px rgba(26, 37, 48, 0.22)",
  },

  /* ---------------------------------------------------------
     LARGE CLOSE BUTTON
  --------------------------------------------------------- */

  closeButton: {
    position: "absolute",
    top: "14px",
    right: "14px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "2px solid #D7EAF7",
    background: "#F0F8FF",
    color: "#1A2530",
    fontSize: "30px",
    fontWeight: "800",
    lineHeight: "1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  /* ---------------------------------------------------------
     MODAL HEADER
  --------------------------------------------------------- */

  modalIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  modalTitle: {
    margin: "0 60px 10px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1A2530",
  },

  /* CORAL CATEGORY TAG */

  category: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "16px",
    background: "#FF6B6B",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "800",
    boxShadow:
      "0 3px 8px rgba(255,107,107,0.25)",
  },

  /* ---------------------------------------------------------
     WHITE INFORMATION CARDS
  --------------------------------------------------------- */

  section: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "16px",
    background: "#FFFFFF",
    border: "1px solid #E2EEF6",
    boxShadow:
      "0 4px 14px rgba(26,37,48,0.08)",
  },

  sectionTitle: {
    margin: "0 0 10px",
    color: "#4A90E2",
    fontSize: "19px",
    fontWeight: "800",
  },

  list: {
    margin: "0",
    paddingLeft: "24px",
    color: "#1A2530",
    lineHeight: "1.7",
    fontSize: "16px",
    fontWeight: "500",
  },

  /* ---------------------------------------------------------
     AVOID SECTION
  --------------------------------------------------------- */

  avoidSection: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "16px",
    background: "#FFF5F5",
    border: "1px solid #FFD1D1",
    boxShadow:
      "0 4px 14px rgba(255,107,107,0.10)",
  },

  avoidTitle: {
    margin: "0 0 10px",
    color: "#FF6B6B",
    fontSize: "19px",
    fontWeight: "800",
  },

  avoidList: {
    margin: "0",
    paddingLeft: "24px",
    color: "#1A2530",
    lineHeight: "1.7",
    fontSize: "16px",
    fontWeight: "500",
  },

  /* ---------------------------------------------------------
     PRIMARY BLUE BUTTON
  --------------------------------------------------------- */

  doneButton: {
    width: "100%",
    marginTop: "25px",
    padding: "16px 20px",
    border: "none",
    borderRadius: "16px",
    background: "#4A90E2",
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 5px 12px rgba(74,144,226,0.30)",
    transition: "all 0.2s ease",
  },
};

/* =========================================================
   ANIMATIONS
========================================================= */

if (typeof document !== "undefined") {
  const styleId =
    "character-injury-hotspot-animation";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @keyframes pulseHotspot {
        0% {
          transform: translate(-50%, -50%) scale(1);
        }

        50% {
          transform: translate(-50%, -50%) scale(1.12);
        }

        100% {
          transform: translate(-50%, -50%) scale(1);
        }
      }

      button:hover {
        opacity: 0.92;
      }

      button:focus-visible {
        outline: 4px solid rgba(74, 144, 226, 0.35);
        outline-offset: 3px;
      }

      @media (max-width: 700px) {
        .character-injury-placeholder {
          width: 95vw;
        }
      }
    `;

    document.head.appendChild(style);
  }
}