import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import RiverDefenderEngine from "./RiverDefenderEngine";
import RiverDefenderRenderer from "./RiverDefenderRenderer";

import {
  DEFENSE_TYPES,
  DEFENSE_ORDER,
} from "./riverDefenderData.js";

import "../../../styles/RiverDefender.css";


// ============================================================
// RIVER DEFENDER — GAME
// ============================================================
// React controller / interface.
//
// IMPORTANT
// ------------------------------------------------------------
// This file controls:
// • Game screens
// • Defense selection
// • Map interaction
// • Mission UI
// • Training guide
// • Result screen
// • Clear player instructions
//
// The ENGINE controls:
// • Water
// • Flood simulation
// • Building safety
// • Unlocks
// • Score
// • XP
//
// The RENDERER controls:
// • World visuals
// • Camera
// • Isometric map
// • Defense visuals
// ============================================================


export default function RiverDefenderGame() {

  // ==========================================================
  // REFERENCES
  // ==========================================================

  const canvasRef =
    useRef(null);

  const engineRef =
    useRef(null);

  const rendererRef =
    useRef(null);

  const animationRef =
    useRef(null);

  const lastFrameRef =
    useRef(null);


  // ==========================================================
  // SCREEN
  // ==========================================================

  const [screen, setScreen] =
    useState("intro");


  // ==========================================================
  // ENGINE SNAPSHOT
  // ==========================================================

  const [snapshot, setSnapshot] =
    useState(null);


  // ==========================================================
  // SELECTED DEFENSE
  // ==========================================================

  const [selectedDefense, setSelectedDefense] =
    useState(null);


  // ==========================================================
  // HOVER CELL
  // ==========================================================

  const [hoverCell, setHoverCell] =
    useState(null);


  // ==========================================================
  // HOW TO PLAY
  // ==========================================================

  const [showHowToPlay, setShowHowToPlay] =
    useState(false);


  // ==========================================================
  // TRAINING
  // ==========================================================

  const [tutorialStep, setTutorialStep] =
    useState(0);


  // ==========================================================
  // ERROR / FEEDBACK
  // ==========================================================

  const [errorMessage, setErrorMessage] =
    useState("");


  // ==========================================================
  // LOCAL GAME ACTION STATE
  // ==========================================================
  //
  // Used only to make the UI more responsive.
  //
  // It does NOT replace the engine.
  // ==========================================================

  const [defensesPlaced, setDefensesPlaced] =
    useState(0);

  // Short-lived UI feedback for successful placements/rewards.
  const [actionFeedback, setActionFeedback] =
    useState("");

// ==========================================================
  // DRAG STATE
  // ==========================================================

  const dragRef =
    useRef({
      active: false,
      moved: false,

      startX: 0,
      startY: 0,

      lastX: 0,
      lastY: 0,
    });


  // ==========================================================
  // CREATE ENGINE
  // ==========================================================

  useEffect(() => {

    const engine =
      new RiverDefenderEngine();

    engineRef.current =
      engine;


    setSnapshot(
      engine.getSnapshot()
    );


    const unsubscribe =
      engine.subscribe(
        (nextSnapshot) => {

          setSnapshot(
            nextSnapshot
          );

        }
      );


    return () => {
      if (unsubscribe) unsubscribe();
      if (engine && typeof engine.destroy === 'function') {
        engine.destroy();
      }
      engineRef.current = null;
    };
  }, []);


  // ==========================================================
  // CREATE RENDERER
  // ==========================================================

  useEffect(() => {
    if (
      screen !== "game" &&
      screen !== "training"
    ) {
      return;
    }

    if (
      !canvasRef.current
    ) {
      return;
    }

    const renderer =
      new RiverDefenderRenderer(
        canvasRef.current
      );

    rendererRef.current =
      renderer;

    return () => {
      if (renderer && typeof renderer.destroy === 'function') {
        renderer.destroy();
      }
      rendererRef.current = null;
    };

  }, [screen]);


  // ==========================================================
  // GAME LOOP
  // ==========================================================

  useEffect(() => {

    if (
      screen !== "game" &&
      screen !== "training"
    ) {
      return;
    }


    const loop =
      (timestamp) => {

        if (
          lastFrameRef.current ===
          null
        ) {

          lastFrameRef.current =
            timestamp;

        }


        const delta =
          Math.min(
            (
              timestamp -
              lastFrameRef.current
            ) / 1000,
            0.1
          );


        lastFrameRef.current =
          timestamp;


        const engine =
          engineRef.current;

        const renderer =
          rendererRef.current;


        if (
          engine &&
          renderer
        ) {

          engine.update(
            delta
          );


          renderer.render(
            engine.getSnapshot()
          );

        }


        animationRef.current =
          requestAnimationFrame(
            loop
          );

      };


    animationRef.current =
      requestAnimationFrame(
        loop
      );


    return () => {

      if (
        animationRef.current
      ) {

        cancelAnimationFrame(
          animationRef.current
        );

      }


      animationRef.current =
        null;

      lastFrameRef.current =
        null;

    };

  }, [screen]);


  // ==========================================================
  // WATCH FOR GAME FINISH
  // ==========================================================

  useEffect(() => {

    if (
      !snapshot?.finished
    ) {
      return;
    }


    if (
      screen === "game" ||
      screen === "training"
    ) {

      setSelectedDefense(
        null
      );


      setHoverCell(
        null
      );


      rendererRef.current?.setSelectedDefense(
        null
      );


      setScreen(
        "result"
      );

    }

  }, [
    snapshot?.finished,
    screen,
  ]);


  // ==========================================================
  // RESET LOCAL UI STATE
  // ==========================================================

  const resetLocalState =
    useCallback(() => {

      setSelectedDefense(
        null
      );

      setHoverCell(
        null
      );

      setErrorMessage("");

      setDefensesPlaced(
        0
      );


      
      setActionFeedback("");

rendererRef.current?.setSelectedDefense(
        null
      );

    }, []);
  // ==========================================================
  // CLEAR SHORT SUCCESS FEEDBACK
  // ==========================================================

  useEffect(() => {

    if (!actionFeedback) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setActionFeedback("");
        },
        2200
      );

    return () => {
      window.clearTimeout(timer);
    };

  }, [actionFeedback]);




  const startGame =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (!engine) {
        return;
      }


      engine.reset();


      resetLocalState();


      setScreen(
        "game"
      );


      requestAnimationFrame(
        () => {

          engine.start();

          rendererRef.current?.setSelectedDefense(
            null
          );

        }
      );

    }, [
      resetLocalState,
    ]);


  // ==========================================================
  // START TRAINING
  // ==========================================================

  const startTraining =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (!engine) {
        return;
      }


      engine.reset();


      resetLocalState();


      setTutorialStep(
        0
      );


      setScreen(
        "training"
      );


      requestAnimationFrame(
        () => {

          rendererRef.current?.setSelectedDefense(
            null
          );

        }
      );

    }, [
      resetLocalState,
    ]);


  // ==========================================================
  // START ACTUAL TRAINING GAME
  // ==========================================================

  const startTrainingGame =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (!engine) {
        return;
      }


      engine.start();


      setErrorMessage("");


      setSelectedDefense(
        null
      );


      rendererRef.current?.setSelectedDefense(
        null
      );

    }, []);


  // ==========================================================
  // RETURN TO INTRO
  // ==========================================================

  const returnToIntro =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (engine) {

        engine.pause();

      }


      resetLocalState();


      setScreen(
        "intro"
      );

    }, [
      resetLocalState,
    ]);


  // ==========================================================
  // SELECT DEFENSE
  // ==========================================================

  const selectDefense =
    useCallback(
      (type) => {

        const engine =
          engineRef.current;

        const renderer =
          rendererRef.current;


        if (
          !engine ||
          !renderer
        ) {
          return;
        }


        const currentSnapshot =
          engine.getSnapshot();


        const count =
          currentSnapshot
            ?.inventory?.[
              type
            ] ?? 0;


        if (
          count <= 0
        ) {

          setErrorMessage(
            "No defenses of this type remain. Protect the town to unlock more."
          );

          return;

        }


        setErrorMessage("");


        setSelectedDefense(
          type
        );


        renderer.setSelectedDefense(
          type
        );

      },
      []
    );


  // ==========================================================
  // CANCEL DEFENSE
  // ==========================================================

  const cancelDefense =
    useCallback(() => {

      setSelectedDefense(
        null
      );


      setErrorMessage("");


      rendererRef.current?.setSelectedDefense(
        null
      );

    }, []);


  // ==========================================================
  // PLACE DEFENSE
  // ==========================================================

  const placeDefenseAtEvent =
    useCallback(
      (event) => {

        const engine =
          engineRef.current;

        const renderer =
          rendererRef.current;

        const canvas =
          canvasRef.current;


        if (
          !engine ||
          !renderer ||
          !canvas ||
          !selectedDefense
        ) {
          return;
        }


        const rect =
          canvas.getBoundingClientRect();


        const screenX =
          event.clientX -
          rect.left;


        const screenY =
          event.clientY -
          rect.top;


        const cell =
          renderer.screenToCell(
            screenX,
            screenY
          );


        if (!cell) {

          setErrorMessage(
            "Choose a location inside the town."
          );

          return;

        }


        const result =
          engine.placeDefense(
            selectedDefense,
            cell.x,
            cell.y
          );


        if (
          !result ||
          !result.success
        ) {

          setErrorMessage(
            result?.message ||
            "That is not a good location. Try another spot."
          );

          return;

        }


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        setErrorMessage("");

        setActionFeedback(
          `✓ ${DEFENSE_TYPES[selectedDefense]?.name || "Defense"} placed successfully.`
        );

        setDefensesPlaced(
          (value) =>
            value + 1
        );


        const remaining =
          engine
            .getSnapshot()
            ?.inventory?.[
              selectedDefense
            ] ?? 0;


        if (
          remaining <= 0
        ) {

          setSelectedDefense(
            null
          );


          renderer.setSelectedDefense(
            null
          );

        }

      },
      [
        selectedDefense,
      ]
    );


  // ==========================================================
  // POINTER DOWN
  // ==========================================================

  const handlePointerDown =
    useCallback(
      (event) => {

        if (
          event.button !== 0
        ) {
          return;
        }


        dragRef.current = {

          active:
            true,

          moved:
            false,

          startX:
            event.clientX,

          startY:
            event.clientY,

          lastX:
            event.clientX,

          lastY:
            event.clientY,

        };


        event.currentTarget.setPointerCapture?.(
          event.pointerId
        );

      },
      []
    );


  // ==========================================================
  // POINTER MOVE
  // ==========================================================

  const handlePointerMove =
    useCallback(
      (event) => {

        const renderer =
          rendererRef.current;

        const canvas =
          canvasRef.current;


        if (
          !renderer ||
          !canvas
        ) {
          return;
        }


        const drag =
          dragRef.current;


        // ------------------------------------------------------
        // DRAG MAP
        // ------------------------------------------------------

        if (
          drag.active
        ) {

          const dx =
            event.clientX -
            drag.lastX;


          const dy =
            event.clientY -
            drag.lastY;


          const totalDx =
            event.clientX -
            drag.startX;


          const totalDy =
            event.clientY -
            drag.startY;


          const distance =
            Math.sqrt(
              (
                totalDx *
                totalDx
              ) +
              (
                totalDy *
                totalDy
              )
            );


          if (
            distance > 5
          ) {

            drag.moved =
              true;

          }


          if (
            drag.moved
          ) {

            renderer.pan(
              dx,
              dy
            );

          }


          drag.lastX =
            event.clientX;


          drag.lastY =
            event.clientY;


          return;

        }


        // ------------------------------------------------------
        // HOVER
        // ------------------------------------------------------

        const rect =
          canvas.getBoundingClientRect();


        const x =
          event.clientX -
          rect.left;


        const y =
          event.clientY -
          rect.top;


        renderer.setHoverFromScreen(
          x,
          y
        );


        const cell =
          renderer.screenToCell(
            x,
            y
          );


        setHoverCell(
          cell
        );

      },
      []
    );


  // ==========================================================
  // POINTER UP
  // ==========================================================

  const handlePointerUp =
    useCallback(
      (event) => {

        const drag =
          dragRef.current;


        const wasClick =
          drag.active &&
          !drag.moved;


        dragRef.current.active =
          false;


        event.currentTarget.releasePointerCapture?.(
          event.pointerId
        );


        if (
          wasClick &&
          selectedDefense
        ) {

          placeDefenseAtEvent(
            event
          );

        }

      },
      [
        selectedDefense,
        placeDefenseAtEvent,
      ]
    );


  // ==========================================================
  // CANVAS LEAVE
  // ==========================================================

  const handleCanvasLeave =
    useCallback(() => {

      rendererRef.current?.clearHover();


      setHoverCell(
        null
      );

    }, []);


  // ==========================================================
  // ZOOM
  // ==========================================================

  const handleWheel =
    useCallback(
      (event) => {

        event.preventDefault();


        const renderer =
          rendererRef.current;


        if (!renderer) {
          return;
        }


        renderer.zoom(
          event.deltaY > 0
            ? -0.06
            : 0.06,

          event.clientX,

          event.clientY
        );

      },
      []
    );


  // ==========================================================
  // CONTEXT MENU
  // ==========================================================

  const handleContextMenu =
    useCallback(
      (event) => {

        event.preventDefault();

      },
      []
    );


  // ==========================================================
  // BUILDING HELPERS
  // ==========================================================

  const getBuilding =
    useCallback(
      (id) => {

        return (
          snapshot?.buildings?.find(
            (building) =>
              building.id === id
          ) ||
          null
        );

      },
      [
        snapshot,
      ]
    );


  const hospital =
    getBuilding(
      "hospital"
    );


  const school =
    getBuilding(
      "school"
    );


  // ==========================================================
  // SAFETY
  // ==========================================================

  const hospitalSafe =
    hospital?.safe ??
    false;


  const schoolSafe =
    school?.safe ??
    false;


  const homesSafe =
    snapshot?.homesSafe ??
    0;


  const homesTotal =
    snapshot?.homesTotal ??
    0;


  const communityPercent =
    homesTotal > 0
      ? Math.round(
          (
            homesSafe /
            homesTotal
          ) *
          100
        )
      : 0;


  const communitySafe =
    communityPercent >=
    80;


  // ==========================================================
  // UNLOCKS
  // ==========================================================

  const unlocked =
    Array.isArray(
      snapshot?.unlocked
    )
      ? snapshot.unlocked
      : [];


  const hospitalRewardUnlocked =
    unlocked.includes(
      "hospital-reward"
    );


  const schoolRewardUnlocked =
    unlocked.includes(
      "school-reward"
    );


  const communityRewardUnlocked =
    unlocked.includes(
      "community-reward"
    );


  // ==========================================================
  // CURRENT OBJECTIVE
  // ==========================================================
  //
  // The ENGINE is the source of truth for progression/unlocks.
  // Local React state is only a fallback for instant feedback.
  // ==========================================================

  const objectiveStage =
    Number.isFinite(
      snapshot?.objectiveStage
    )
      ? snapshot.objectiveStage
      : (
          communityRewardUnlocked
            ? 3
            : schoolRewardUnlocked
              ? 2
              : hospitalRewardUnlocked
                ? 1
                : 0
        );

  const hasPlacedDefense =
    snapshot?.hasPlacedDefense === true ||
    defensesPlaced > 0;

  let objectiveTitle =
    "FIRST MOVE";

  let objectiveText =
    "Choose a defense and place it near the flood path.";

  let objectiveIcon =
    "🎯";


  if (
    !snapshot?.running
  ) {

    objectiveTitle =
      "READY";

    objectiveText =
      "Choose a defense, place it on the map, then protect the hospital, school and community.";

    objectiveIcon =
      "🛡️";

  }


  if (
    snapshot?.running &&
    !hasPlacedDefense
  ) {

    objectiveTitle =
      "MAKE YOUR FIRST MOVE";

    objectiveText =
      "Choose a defense, then click the map near the flood path. Your first placement starts your protection plan.";

    objectiveIcon =
      "🎯";

  }


  if (
    snapshot?.running &&
    hasPlacedDefense &&
    objectiveStage === 0 &&
    !hospitalRewardUnlocked
  ) {

    objectiveTitle =
      "PROTECT THE HOSPITAL";

    objectiveText =
      hospitalSafe
        ? "🏥 Hospital is safe for now. Keep the flood away until the hospital objective is secured."
        : "🚨 Hospital is in danger! Redirect, slow or remove floodwater before it reaches the hospital.";

    objectiveIcon =
      "🏥";

  }


  if (
    snapshot?.running &&
    (
      objectiveStage >= 1 ||
      hospitalRewardUnlocked
    ) &&
    !schoolRewardUnlocked
  ) {

    objectiveTitle =
      "PROTECT THE SCHOOL";

    objectiveText =
      schoolSafe
        ? "🏫 Hospital secured! Keep the school safe while the flood continues."
        : "🚨 Protect the school! Use your remaining defenses where they will have the most impact.";

    objectiveIcon =
      "🏫";

  }


  if (
    snapshot?.running &&
    (
      objectiveStage >= 2 ||
      schoolRewardUnlocked
    ) &&
    !communityRewardUnlocked
  ) {

    objectiveTitle =
      "SAVE THE COMMUNITY";

    objectiveText =
      `🏠 Save at least 80% of the homes. Current safety: ${communityPercent}%.`;

    objectiveIcon =
      "🏠";

  }


  if (
    snapshot?.running &&
    (
      objectiveStage >= 3 ||
      communityRewardUnlocked
    )
  ) {

    objectiveTitle =
      "KEEP THE TOWN SAFE";

    objectiveText =
      `🌊 Community protected! ${communityPercent}% of homes are currently safe. Survive until the flood ends.`;

    objectiveIcon =
      "🏆";

  }


  const engineFeedback =
    snapshot?.message &&
    snapshot.messageType === "reward"
      ? snapshot.message
      : "";


  // ==========================================================
  // STATUS TEXT
  // ==========================================================

  const statusText =
    selectedDefense
      ? `🎯 Placing ${
          DEFENSE_TYPES[
            selectedDefense
          ]?.name ||
          "defense"
        } — click the map`
      : (
          engineFeedback ||
          actionFeedback ||
          objectiveText
        );


  // ==========================================================
  // INTRO
  // ==========================================================

  if (
    screen === "intro"
  ) {

    return (

      <div className="river-defender-page">

        <div className="river-intro">

          <div className="river-intro-water" />


          <div className="river-intro-content">

            <div className="river-eyebrow">
              DISASTERVERSE • FLOOD RESPONSE
            </div>


            <h1>
              RIVER
              <span>
                {" "}
                DEFENDER
              </span>
            </h1>


            <p className="river-tagline">
              PROTECT. PLAN. PREVAIL.
            </p>


            <p className="river-intro-description">

              A flood is coming.
              Protect the hospital,
              school and community
              before the water rises.

            </p>


            <div className="river-intro-actions">

              <button
                className="river-primary-button"
                onClick={() =>
                  setShowHowToPlay(
                    true
                  )
                }
              >
                START GAME
              </button>


              <button
                className="river-secondary-button"
                onClick={() =>
                  setShowHowToPlay(
                    true
                  )
                }
              >
                HOW TO PLAY
              </button>


              <button
                className="river-training-button"
                onClick={
                  startTraining
                }
              >
                TRAINING MODE
              </button>

            </div>


            <div className="river-simple-rule">

              <span>
                🧱
              </span>

              Place defenses

              <span>
                →
              </span>

              <span>
                🏥
              </span>

              Protect buildings

              <span>
                →
              </span>

              <span>
                🏆
              </span>

              Save the town

            </div>

          </div>


          {showHowToPlay && (

            <HowToPlayModal

              onClose={() =>
                setShowHowToPlay(
                  false
                )
              }

              onStart={() => {

                setShowHowToPlay(
                  false
                );

                startGame();

              }}

            />

          )}

        </div>

      </div>

    );

  }


  // ==========================================================
  // RESULT
  // ==========================================================

  if (
    screen === "result" ||
    snapshot?.finished
  ) {

    return (

      <ResultScreen

        snapshot={
          snapshot
        }

        hospitalSafe={
          hospitalSafe
        }

        schoolSafe={
          schoolSafe
        }

        homesSafe={
          homesSafe
        }

        homesTotal={
          homesTotal
        }

        onReplay={
          startGame
        }

        onExit={
          returnToIntro
        }

      />

    );

  }


  // ==========================================================
  // GAME / TRAINING
  // ==========================================================

  const isTraining =
    screen === "training";


  return (

    <div className="river-defender-page river-game-page">


      {/* ======================================================
          TOP BAR
          ====================================================== */}

      <header className="river-topbar">


        <div className="river-brand">

          <div className="river-brand-icon">
            🌊
          </div>


          <div>

            <strong>
              RIVER DEFENDER
            </strong>

            <span>
              PROTECT THE CITY
            </span>

          </div>

        </div>


        <div className="river-top-stats">


          <div className="river-stat">

            <span>
              RIVER
            </span>

            <strong>

              {Math.round(
                (
                  snapshot?.riverLevel ??
                  0
                ) *
                100
              )}

              %

            </strong>

          </div>


          <div className="river-stat">

            <span>
              RAIN
            </span>

            <strong>

              {snapshot?.rainfall ??
                0}

              mm

            </strong>

          </div>


          <div className="river-stat">

            <span>
              SAFE
            </span>

            <strong>

              {snapshot?.buildingsSafe ??
                0}

              /

              {snapshot?.buildingsTotal ??
                0}

            </strong>

          </div>


          <button
            className="river-exit-button"
            onClick={
              returnToIntro
            }
          >
            EXIT
          </button>

        </div>

      </header>


      {/* ======================================================
          GAME AREA
          ====================================================== */}

      <main className="river-game-layout">


        {/* ====================================================
            WORLD
            ==================================================== */}

        <section
          className="river-world-container"
        >

          <canvas

            ref={
              canvasRef
            }

            id="river-defender-world"

            className="river-world-canvas"

            onMouseMove={
              handlePointerMove
            }

            onMouseLeave={
              handleCanvasLeave
            }

            onWheel={
              handleWheel
            }

            onPointerDown={
              handlePointerDown
            }

            onPointerMove={
              handlePointerMove
            }

            onPointerUp={
              handlePointerUp
            }

            onContextMenu={
              handleContextMenu
            }

          />


          {/* ==================================================
              OBJECTIVE MESSAGE
              ================================================== */}

          <div
            className={`river-message ${
              snapshot?.messageType ||
              ""
            }`}
          >

            <strong>
              {selectedDefense
                ? `🎯 PLACE ${
                    DEFENSE_TYPES[
                      selectedDefense
                    ]?.name ||
                    "DEFENSE"
                  }`
                : `${objectiveIcon} ${objectiveTitle}`}
            </strong>


            <span>

              {selectedDefense
                ? "Click a safe location on the map."
                : (
                    engineFeedback ||
                    actionFeedback ||
                    objectiveText
                  )}

            </span>

          </div>


          {/* ==================================================
              TRAINING GUIDE
              ================================================== */}

          {isTraining && (

            <TrainingGuide

              step={
                tutorialStep
              }

              setStep={
                setTutorialStep
              }

              onStart={
                startTrainingGame
              }

            />

          )}


          {/* ==================================================
              PLACEMENT HINT
              ================================================== */}

          {hoverCell &&
            selectedDefense && (

              <div className="river-placement-hint">

                🎯 Click to place{" "}

                {
                  DEFENSE_TYPES[
                    selectedDefense
                  ]?.name
                }

              </div>

          )}

        </section>


        {/* ====================================================
            MISSION PANEL
            ==================================================== */}

        <aside className="river-objectives">


          <div className="river-panel-title">
            YOUR MISSION
          </div>


          {/* CURRENT OBJECTIVE */}

          <div
            className="river-objective river-current-objective"
          >

            <span className="complete">
              {objectiveIcon}
            </span>


            <div>

              <strong>
                {objectiveTitle}
              </strong>


              <small>
                {objectiveText}
              </small>

            </div>

          </div>


          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              opacity: 0.85,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            STEP {Math.min(objectiveStage + 1, 4)}
            {" • "}
            {objectiveStage === 0
              ? "HOSPITAL"
              : objectiveStage === 1
                ? "SCHOOL"
                : objectiveStage === 2
                  ? "COMMUNITY"
                  : "SURVIVE"}
          </div>


          {/* HOSPITAL */}

          <div className="river-objective">

            <span
              className={
                hospitalRewardUnlocked
                  ? "complete"
                  : ""
              }
            >

              {hospitalRewardUnlocked
                ? "✓"
                : "○"}

            </span>


            <div>

              <strong>
                Protect Hospital
              </strong>


              <small>

                {hospitalRewardUnlocked

                  ? "Hospital protected — reward unlocked!"

                  : hospitalSafe

                    ? "Hospital is currently safe. Keep watching the flood."

                    : "🚨 Hospital is in danger!"}

              </small>

            </div>

          </div>


          {/* SCHOOL */}

          <div className="river-objective">

            <span
              className={
                schoolRewardUnlocked
                  ? "complete"
                  : ""
              }
            >

              {schoolRewardUnlocked
                ? "✓"
                : "○"}

            </span>


            <div>

              <strong>
                Protect School
              </strong>


              <small>

                {schoolRewardUnlocked

                  ? "School protected — new progression unlocked!"

                  : schoolSafe

                    ? "School is currently safe."

                    : "🚨 Keep floodwater away from the school."}

              </small>

            </div>

          </div>


          {/* COMMUNITY */}

          <div className="river-objective">

            <span
              className={
                communityRewardUnlocked ||
                communitySafe
                  ? "complete"
                  : ""
              }
            >

              {communityRewardUnlocked ||
              communitySafe
                ? "✓"
                : "○"}

            </span>


            <div>

              <strong>
                Protect Community
              </strong>


              <small>

                Save at least 80%
                of the homes.

              </small>

            </div>

          </div>


          {/* HOMES */}

          <div className="river-community-progress">

            <div>

              <span>
                HOMES SAFE
              </span>


              <strong>
                {communityPercent}%
              </strong>

            </div>


            <div
              className="river-progress-track"
            >

              <div
                className="river-progress-fill"
                style={{
                  width:
                    `${Math.min(
                      communityPercent,
                      100
                    )}%`,
                }}
              />

            </div>

          </div>


          {/* LIVE TIP */}

          <div className="river-tip">

            <span>
              💡
            </span>


            <p>

              {selectedDefense

                ? "Click near the flood path, not directly on a building."

                : "Watch the water. Place defenses where they can redirect, slow or remove floodwater."}

            </p>

          </div>

        </aside>


        {/* ====================================================
            DEFENSE PANEL
            ==================================================== */}

        <aside className="river-tools">


          <div className="river-panel-title">
            DEFENSES
          </div>


          <p className="river-tool-help">

            {selectedDefense

              ? `🎯 ${
                  DEFENSE_TYPES[
                    selectedDefense
                  ]?.name ||
                  "Defense"
                } selected — click the town to place it.`

              : (
                  objectiveStage === 0
                    ? "Start with a defense near the flood path."
                    : objectiveStage === 1
                      ? "Hospital secured. Choose the best defense for the school."
                      : objectiveStage === 2
                        ? "School secured. Protect as many homes as possible."
                        : "Keep monitoring the flood and reinforce weak areas."
                )}

          </p>


          <div className="river-tool-list">

            {DEFENSE_ORDER.map(
              (type) => {

                const defense =
                  DEFENSE_TYPES[
                    type
                  ];


                if (!defense) {
                  return null;
                }


                const count =
                  snapshot
                    ?.inventory?.[
                      type
                    ] ??
                  0;


                const active =
                  selectedDefense ===
                  type;


                return (

                  <button

                    key={
                      type
                    }

                    className={`river-tool ${
                      active
                        ? "selected"
                        : ""
                    } ${
                      count <= 0
                        ? "empty"
                        : ""
                    }`}

                    onClick={() =>
                      selectDefense(
                        type
                      )
                    }

                    disabled={
                      count <= 0
                    }

                  >

                    <span
                      className="river-tool-icon"
                    >
                      {defense.icon}
                    </span>


                    <span
                      className="river-tool-info"
                    >

                      <strong>
                        {defense.name}
                      </strong>


                      <small>
                        {defense.description}
                      </small>

                    </span>


                    <span
                      className="river-tool-count"
                    >
                      ×{count}
                    </span>

                  </button>

                );

              }
            )}

          </div>


          {/* CANCEL */}

          {selectedDefense && (

            <button

              className="river-cancel-tool"

              onClick={
                cancelDefense
              }

            >
              CANCEL PLACEMENT
            </button>

          )}


          {/* ERROR */}

          {errorMessage && (

            <div
              className="river-error"
            >

              ⚠️{" "}
              {errorMessage}

            </div>

          )}


          {/* CONTROLS */}

          <div className="river-mini-guide">


            <div>

              <span>
                🖱️
              </span>

              Click map

            </div>


            <div>

              <span>
                ✋
              </span>

              Drag to move

            </div>


            <div>

              <span>
                🔍
              </span>

              Scroll to zoom

            </div>

          </div>


          {/* LEGEND */}

          <div className="river-defense-legend">


            <div>

              <span>
                🧱
              </span>

              <small>
                Redirect
              </small>

            </div>


            <div>

              <span>
                🟨
              </span>

              <small>
                Slow
              </small>

            </div>


            <div>

              <span>
                💧
              </span>

              <small>
                Remove
              </small>

            </div>

          </div>

        </aside>

      </main>


      {/* ======================================================
          BOTTOM STATUS
          ====================================================== */}

      <footer className="river-bottom-bar">


        <div className="river-status-left">

          <span
            className="river-status-dot"
          />


          <span>

            {snapshot?.running
              ? "FLOOD ACTIVE"
              : "READY"}

          </span>

        </div>


        <div className="river-status-center">

          {statusText}

        </div>


        <div className="river-status-right">

          XP{" "}

          <strong>
            {snapshot?.xp ??
              0}
          </strong>


          <span>
            •
          </span>


          SCORE{" "}

          <strong>
            {snapshot?.score ??
              0}
          </strong>

        </div>

      </footer>

    </div>

  );

}


// ============================================================
// HOW TO PLAY MODAL
// ============================================================

function HowToPlayModal({
  onClose,
  onStart,
}) {

  return (

    <div
      className="river-modal-backdrop"
    >

      <div
        className="river-howto"
      >


        <button

          className="river-modal-close"

          onClick={
            onClose
          }

        >
          ×
        </button>


        <div className="river-modal-eyebrow">
          RIVER DEFENDER
        </div>


        <h2>
          HOW TO PLAY
        </h2>


        <p className="river-howto-intro">

          A flood is coming.
          Your job is to protect
          the town before the
          water reaches its
          critical buildings.

        </p>


        <div className="river-howto-grid">


          <div>

            <span>
              1
            </span>


            <strong>
              WATCH THE RIVER
            </strong>


            <p>
              The river rises
              and floodwater
              spreads through
              the town.
            </p>

          </div>


          <div>

            <span>
              2
            </span>


            <strong>
              CHOOSE A DEFENSE
            </strong>


            <p>
              Pick a flood wall,
              sandbags or pump.
            </p>

          </div>


          <div>

            <span>
              3
            </span>


            <strong>
              PLACE IT
            </strong>


            <p>
              Click a suitable
              location near the
              flood path.
            </p>

          </div>


          <div>

            <span>
              4
            </span>


            <strong>
              PROTECT THE HOSPITAL
            </strong>


            <p>
              Keep the critical
              building safe while
              the river rises.
            </p>

          </div>


          <div>

            <span>
              5
            </span>


            <strong>
              PROTECT THE SCHOOL
            </strong>


            <p>
              Successfully protect
              key buildings to earn
              more defensive tools.
            </p>

          </div>


          <div>

            <span>
              6
            </span>


            <strong>
              SAVE THE COMMUNITY
            </strong>


            <p>
              Keep at least 80%
              of homes safe until
              the flood ends.
            </p>

          </div>

        </div>


        <div className="river-howto-tools">


          <div>

            <span>
              🧱
            </span>


            <strong>
              Flood Wall
            </strong>


            <small>
              Redirect water
            </small>

          </div>


          <div>

            <span>
              🟨
            </span>


            <strong>
              Sandbags
            </strong>


            <small>
              Slow water
            </small>

          </div>


          <div>

            <span>
              💧
            </span>


            <strong>
              Pump
            </strong>


            <small>
              Remove water
            </small>

          </div>

        </div>


        <button

          className="river-primary-button"

          onClick={
            onStart
          }

        >
          START GAME
        </button>

      </div>

    </div>

  );

}


// ============================================================
// TRAINING GUIDE
// ============================================================

function TrainingGuide({
  step,
  setStep,
  onStart,
}) {

  const steps = [

    {
      title:
        "1. BUILD A FLOOD WALL",

      text:
        "Choose 🧱 Flood Wall and place it near the path where floodwater is moving.",

      icon:
        "🧱",
    },


    {
      title:
        "2. WATCH THE WATER",

      text:
        "Your defenses change how the flood moves through the town.",

      icon:
        "🌊",
    },


    {
      title:
        "3. USE A PUMP",

      text:
        "Use 💧 Pump near areas where water starts collecting.",

      icon:
        "💧",
    },


    {
      title:
        "4. PROTECT THE HOSPITAL",

      text:
        "The hospital is a critical building. Keep floodwater away from it.",

      icon:
        "🏥",
    },


    {
      title:
        "5. PROTECT THE SCHOOL",

      text:
        "After securing the hospital, focus on the school and continue managing the flood.",

      icon:
        "🏫",
    },


    {
      title:
        "6. SAVE THE COMMUNITY",

      text:
        "Your final goal is to keep at least 80% of the homes safe until the flood ends.",

      icon:
        "🏠",
    },


    {
      title:
        "TRAINING COMPLETE",

      text:
        "You know the basics. Now defend the town for real!",

      icon:
        "🏆",
    },

  ];


  const current =
    steps[
      Math.min(
        step,
        steps.length - 1
      )
    ];


  const isLast =
    step >=
    steps.length - 1;


  return (

    <div
      className="river-training-guide"
    >


      <div
        className="river-training-icon"
      >
        {current.icon}
      </div>


      <div>

        <strong>
          {current.title}
        </strong>


        <p>
          {current.text}
        </p>

      </div>


      {!isLast && (

        <button
          onClick={() =>
            setStep(
              step + 1
            )
          }
        >
          NEXT
        </button>

      )}


      {isLast && (

        <button
          onClick={
            onStart
          }
        >
          PLAY
        </button>

      )}

    </div>

  );

}


// ============================================================
// RESULT SCREEN
// ============================================================

function ResultScreen({
  snapshot,
  hospitalSafe,
  schoolSafe,
  homesSafe,
  homesTotal,
  onReplay,
  onExit,
}) {

  const communityPercent =
    homesTotal > 0
      ? Math.round(
          (
            homesSafe /
            homesTotal
          ) *
          100
        )
      : 0;


  const won =
    hospitalSafe &&
    schoolSafe &&
    communityPercent >=
      80;


  return (

    <div
      className="river-result-page"
    >


      <div
        className="river-result-card"
      >


        <div
          className="river-result-icon"
        >
          {won
            ? "🏆"
            : "🌊"}
        </div>


        <div className="river-eyebrow">
          RIVER DEFENDER
        </div>


        <h1>

          {won
            ? "CITY SAVED!"
            : "THE FLOOD WON"}

        </h1>


        <p>

          {won

            ? "Excellent planning. You protected the community."

            : "The flood overwhelmed the town. Try again and place your defenses earlier."}

        </p>


        <div className="river-result-stats">


          <div>

            <span>
              HOSPITAL
            </span>


            <strong>

              {hospitalSafe
                ? "SAFE ✓"
                : "FLOODED"}

            </strong>

          </div>


          <div>

            <span>
              SCHOOL
            </span>


            <strong>

              {schoolSafe
                ? "SAFE ✓"
                : "FLOODED"}

            </strong>

          </div>


          <div>

            <span>
              HOMES
            </span>


            <strong>
              {communityPercent}%
            </strong>

          </div>


          <div>

            <span>
              SCORE
            </span>


            <strong>
              {snapshot?.score ??
                0}
            </strong>

          </div>

        </div>


        <div
          className="river-result-actions"
        >


          <button
            className="river-primary-button"
            onClick={
              onReplay
            }
          >
            PLAY AGAIN
          </button>


          <button
            className="river-secondary-button"
            onClick={
              onExit
            }
          >
            MAIN MENU
          </button>

        </div>

      </div>

    </div>

  );

}