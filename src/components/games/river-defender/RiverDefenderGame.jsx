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
// Main React controller.
//
// FLOW
// ------------------------------------------------------------
// INTRO
//   ↓
// HOW TO PLAY
//   ↓
// GAME
//   ↓
// RESULT
//
// GAMEPLAY
// ------------------------------------------------------------
// • Watch the flood
// • Select a defense
// • Click a good location
// • Drag the map to explore
// • Protect hospital
// • Protect school
// • Protect community
//
// IMPORTANT
// ------------------------------------------------------------
// There is NO budget.
// There is NO money.
// There are NO prices.
//
// XP and SCORE are game feedback only.
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
  // DEFENSE SELECTION
  // ==========================================================

  const [selectedDefense, setSelectedDefense] =
    useState(null);


  // ==========================================================
  // HOVER CELL
  // ==========================================================

  const [hoverCell, setHoverCell] =
    useState(null);


  // ==========================================================
  // MODALS / TRAINING
  // ==========================================================

  const [showHowToPlay, setShowHowToPlay] =
    useState(false);

  const [tutorialStep, setTutorialStep] =
    useState(0);


  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  const [errorMessage, setErrorMessage] =
    useState("");


  // ==========================================================
  // MAP DRAG STATE
  // ==========================================================
  //
  // IMPORTANT:
  //
  // Left mouse:
  //   click       → place defense
  //   drag        → pan map
  //
  // This makes the map much easier to explore.
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

      unsubscribe();

      engine.destroy();

      engineRef.current =
        null;
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

      renderer.destroy();

      rendererRef.current =
        null;
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
  // WATCH FOR FINISH
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
  // START GAME
  // ==========================================================

  const startGame =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (!engine) {
        return;
      }


      engine.reset();


      setSelectedDefense(
        null
      );

      setHoverCell(
        null
      );

      setErrorMessage("");


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

    }, []);


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


      setSelectedDefense(
        null
      );

      setHoverCell(
        null
      );

      setTutorialStep(
        0
      );

      setErrorMessage("");


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

    }, []);


  // ==========================================================
  // START TRAINING GAME
  // ==========================================================

  const startTrainingGame =
    useCallback(() => {

      const engine =
        engineRef.current;


      if (!engine) {
        return;
      }


      engine.start();


      setSelectedDefense(
        null
      );

      setErrorMessage("");

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


      setSelectedDefense(
        null
      );

      setHoverCell(
        null
      );

      setErrorMessage("");


      rendererRef.current?.setSelectedDefense(
        null
      );


      setScreen(
        "intro"
      );

    }, []);


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
            "You've used all of these! Protect buildings to unlock more."
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
  //
  // This is deliberately separate from pointer movement.
  //
  // A normal click places a defense.
  // A drag moves the map.
  // ==========================================================

  const handleCanvasClick =
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


        const x =
          event.clientX -
          rect.left;


        const y =
          event.clientY -
          rect.top;


        const cell =
          renderer.screenToCell(
            x,
            y
          );


        if (!cell) {
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
            "You cannot place that defense here."
          );

          return;
        }


        setErrorMessage("");


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
  //
  // Start a possible drag.
  // We don't immediately know whether the user wants to:
  //
  // 1. click to place
  // 2. drag to pan
  //
  // So we wait until pointer-up.
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
          active: true,
          moved: false,

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


        // ====================================================
        // MAP DRAGGING
        // ====================================================

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
              totalDx * totalDx +
              totalDy * totalDy
            );


          // 5px prevents tiny mouse movements from
          // turning clicks into drags.

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


        // ====================================================
        // HOVER
        // ====================================================

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


        // ====================================================
        // NORMAL CLICK
        // ====================================================

        if (
          wasClick &&
          selectedDefense
        ) {

          handleCanvasClick(
            event
          );
        }

      },
      [
        selectedDefense,
        handleCanvasClick,
      ]
    );


  // ==========================================================
  // CANVAS LEAVE
  // ==========================================================

  const handleCanvasLeave =
    useCallback(() => {

      const renderer =
        rendererRef.current;


      if (renderer) {
        renderer.clearHover();
      }


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
  // RESTART
  // ==========================================================

  const restartGame =
    useCallback(() => {

      startGame();

    }, [
      startGame,
    ]);


  // ==========================================================
  // BUILDING HELPERS
  // ==========================================================

  const getBuilding =
    useCallback(
      (id) => {

        return snapshot
          ?.buildings
          ?.find(
            (building) =>
              building.id ===
              id
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


  const hospitalSafe =
    hospital?.safe ??
    true;


  const schoolSafe =
    school?.safe ??
    true;


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
          ) * 100
        )
      : 0;


  const communitySafe =
    communityPercent >=
    80;


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

              <span>🧱</span>

              Place defenses

              <span>→</span>

              <span>🏥</span>

              Protect buildings

              <span>→</span>

              <span>🏆</span>

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
          restartGame
        }

        onExit={
          returnToIntro
        }
      />
    );
  }


  // ==========================================================
  // GAME
  // ==========================================================

  const isTraining =
    screen === "training";


  return (
    <div className="river-defender-page river-game-page">

      {/* =====================================================
          TOP BAR
          ===================================================== */}

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
                ) * 100
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


      {/* =====================================================
          GAME AREA
          ===================================================== */}

      <main className="river-game-layout">


        {/* =================================================
            MAP
            ================================================= */}

        <section
          className="river-world-container"
        >

          <canvas
            ref={canvasRef}

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


          {/* GAME MESSAGE */}

          <div
            className={`river-message ${
              snapshot?.messageType ||
              ""
            }`}
          >
            {snapshot?.message}
          </div>


          {/* TRAINING */}

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


          {/* PLACEMENT HINT */}

          {hoverCell &&
            selectedDefense && (

              <div
                className="river-placement-hint"
              >
                Click to place{" "}
                {
                  DEFENSE_TYPES[
                    selectedDefense
                  ]?.name
                }
              </div>

            )}

        </section>


        {/* =================================================
            MISSION HUD
            ================================================= */}

        <aside className="river-objectives">

          <div className="river-panel-title">
            YOUR MISSION
          </div>


          <div className="river-objective">

            <span
              className={
                hospitalSafe
                  ? "complete"
                  : ""
              }
            >
              {hospitalSafe
                ? "✓"
                : "○"}
            </span>


            <div>

              <strong>
                Protect Hospital
              </strong>

              <small>
                Keep the critical
                building safe.
              </small>

            </div>

          </div>


          <div className="river-objective">

            <span
              className={
                schoolSafe
                  ? "complete"
                  : ""
              }
            >
              {schoolSafe
                ? "✓"
                : "○"}
            </span>


            <div>

              <strong>
                Protect School
              </strong>

              <small>
                Keep students safe.
              </small>

            </div>

          </div>


          <div className="river-objective">

            <span
              className={
                communitySafe
                  ? "complete"
                  : ""
              }
            >
              {communitySafe
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


          <div className="river-community-progress">

            <div>

              <span>
                HOMES SAFE
              </span>

              <strong>
                {communityPercent}%
              </strong>

            </div>


            <div className="river-progress-track">

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


          <div className="river-tip">

            <span>
              💡
            </span>

            <p>
              Place defenses near
              the path of the
              flood — not directly
              on buildings.
            </p>

          </div>

        </aside>


        {/* =================================================
            DEFENSE HUD
            ================================================= */}

        <aside className="river-tools">

          <div className="river-panel-title">
            DEFENSES
          </div>


          <p className="river-tool-help">
            Choose a tool, then
            click the town to place it.
          </p>


          <div className="river-tool-list">

            {DEFENSE_ORDER.map(
              (type) => {

                const defense =
                  DEFENSE_TYPES[
                    type
                  ];


                const count =
                  snapshot
                    ?.inventory?.[
                      type
                    ] ?? 0;


                const active =
                  selectedDefense ===
                  type;


                return (

                  <button
                    key={type}

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
                        {
                          defense.description
                        }
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


          {errorMessage && (

            <div
              className="river-error"
            >
              {errorMessage}
            </div>

          )}


          <div className="river-mini-guide">

            <div>
              <span>🖱️</span>
              Click map
            </div>


            <div>
              <span>✋</span>
              Drag to move
            </div>


            <div>
              <span>🔍</span>
              Scroll to zoom
            </div>

          </div>


          <div className="river-defense-legend">

            <div>
              <span>🧱</span>

              <small>
                Redirect
              </small>
            </div>


            <div>
              <span>🟨</span>

              <small>
                Slow
              </small>
            </div>


            <div>
              <span>💧</span>

              <small>
                Remove
              </small>
            </div>

          </div>

        </aside>

      </main>


      {/* =====================================================
          BOTTOM STATUS
          ===================================================== */}

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

          {selectedDefense

            ? `Placing ${
                DEFENSE_TYPES[
                  selectedDefense
                ]?.name
              }`

            : "Select a defense to begin"}

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
          It's simple:
          protect the town
          before the flood
          reaches it.
        </p>


        <div className="river-howto-grid">

          <div>

            <span>1</span>

            <strong>
              Watch the river
            </strong>

            <p>
              The river rises
              and floodwater
              spreads through
              the town.
            </p>

          </div>


          <div>

            <span>2</span>

            <strong>
              Choose a defense
            </strong>

            <p>
              Use flood walls,
              sandbags and
              pumps.
            </p>

          </div>


          <div>

            <span>3</span>

            <strong>
              Place it
            </strong>

            <p>
              Select a defense
              and click a good
              location on the map.
            </p>

          </div>


          <div>

            <span>4</span>

            <strong>
              Protect buildings
            </strong>

            <p>
              Keep the hospital,
              school and homes
              safe.
            </p>

          </div>


          <div>

            <span>5</span>

            <strong>
              Earn more defenses
            </strong>

            <p>
              Successful decisions
              unlock additional
              tools.
            </p>

          </div>


          <div>

            <span>6</span>

            <strong>
              Save the town
            </strong>

            <p>
              Keep the community
              safe until the flood
              ends.
            </p>

          </div>

        </div>


        <div className="river-howto-tools">

          <div>

            <span>🧱</span>

            <strong>
              Flood Wall
            </strong>

            <small>
              Redirect water
            </small>

          </div>


          <div>

            <span>🟨</span>

            <strong>
              Sandbags
            </strong>

            <small>
              Slow water
            </small>

          </div>


          <div>

            <span>💧</span>

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
        "Choose 🧱 Flood Wall and place it near the path where the flood is moving.",

      icon:
        "🧱",
    },


    {
      title:
        "2. WATCH THE FLOOD",

      text:
        "Watch how the water moves through the town and around your defenses.",

      icon:
        "🌊",
    },


    {
      title:
        "3. PLACE A PUMP",

      text:
        "Choose 💧 Pump and place it where floodwater begins collecting.",

      icon:
        "💧",
    },


    {
      title:
        "4. PROTECT THE HOSPITAL",

      text:
        "Your most important job is keeping critical buildings safe.",

      icon:
        "🏥",
    },


    {
      title:
        "5. PROTECT THE COMMUNITY",

      text:
        "Use your defenses wisely and try to save as many homes as possible.",

      icon:
        "🏠",
    },


    {
      title:
        "TRAINING COMPLETE",

      text:
        "You know the basics! Now you're ready to defend the town.",

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
          ) * 100
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
            : "Try again and place your defenses earlier."}
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