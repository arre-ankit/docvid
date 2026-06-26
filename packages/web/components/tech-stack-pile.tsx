"use client";

import { useEffect, useRef } from "react";
// Type-only: the runtime library is dynamically imported inside the effect so
// its module-load time read (`Date.now()`) never runs during prerender.
import type * as MatterNS from "matter-js";
import {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siPython,
  siGo,
  siRust,
  siNodedotjs,
  siDocker,
  siKubernetes,
  siPostgresql,
  siMongodb,
  siRedis,
  siGraphql,
  siTailwindcss,
  siVuedotjs,
  siAngular,
  siSvelte,
  siPhp,
  siRuby,
  siRubyonrails,
  siDjango,
  siFlutter,
  siSwift,
  siKotlin,
  siFirebase,
  siVercel,
  siGit,
  siLinux,
  siSass,
  siGooglecloud,
  siVite,
  siElixir,
  siCplusplus,
  type SimpleIcon,
} from "simple-icons";

/* The docs/stacks shown as physics tiles. Order is irrelevant — gravity sorts them. */
const ICONS: SimpleIcon[] = [
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siPython,
  siGo,
  siRust,
  siNodedotjs,
  siDocker,
  siKubernetes,
  siPostgresql,
  siMongodb,
  siRedis,
  siGraphql,
  siTailwindcss,
  siVuedotjs,
  siAngular,
  siSvelte,
  siPhp,
  siRuby,
  siRubyonrails,
  siDjango,
  siFlutter,
  siSwift,
  siKotlin,
  siFirebase,
  siVercel,
  siGit,
  siLinux,
  siSass,
  siGooglecloud,
  siVite,
  siElixir,
  siCplusplus,
];

export function TechStackPile() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const mod = await import("matter-js");
      const Matter =
        (mod as unknown as { default?: typeof MatterNS }).default ??
        (mod as unknown as typeof MatterNS);
      if (cancelled) return;
      cleanup = setup(Matter);
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };

    // Builds the physics scene once Matter has loaded; returns its teardown.
    function setup(Matter: typeof MatterNS): () => void {
      if (!scene) return () => {};

    // Respect users who prefer no motion: leave the tiles statically piled.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = scene.clientWidth;
    let height = scene.clientHeight;
    const tile = 54; // must match the DOM tile size below

    const engine = Matter.Engine.create();
    engine.gravity.y = 0; // held until the section scrolls into view

    // ---- Boundaries: floor + two side walls (open top so tiles can be thrown up) ----
    const wallOpts: MatterNS.IChamferableBodyDefinition = { isStatic: true };
    const makeWalls = () => [
      Matter.Bodies.rectangle(width / 2, height + 100, width + 600, 200, wallOpts), // floor
      Matter.Bodies.rectangle(-100, height / 2, 200, height * 4, wallOpts), // left
      Matter.Bodies.rectangle(width + 100, height / 2, 200, height * 4, wallOpts), // right
      Matter.Bodies.rectangle(width / 2, -100, width + 600, 200, wallOpts), // ceiling — keeps tiles from drifting off the top
    ];
    let walls = makeWalls();
    Matter.Composite.add(engine.world, walls);

    // ---- One body per tile, dropped from above so they cascade into a pile ----
    const bodies = ICONS.map(() =>
      Matter.Bodies.rectangle(
        40 + Math.random() * (width - 80),
        30 + Math.random() * (height * 0.35), // wait near the top, then drop in on scroll
        tile,
        tile,
        {
          chamfer: { radius: 8 },
          restitution: 0.3, // gentle bounce so they settle into the pile
          friction: 0.4,
          frictionAir: 0.02,
          angle: (Math.random() - 0.5) * 0.6,
        },
      ),
    );
    Matter.Composite.add(engine.world, bodies);

    // ---- Drag + throw with momentum ----
    const mouse = Matter.Mouse.create(scene);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.Composite.add(engine.world, mouseConstraint);
    // Don't let Matter swallow page scroll over the section.
    const wheelHandler = (mouse as unknown as { mousewheel: EventListener })
      .mousewheel;
    mouse.element.removeEventListener("wheel", wheelHandler);
    mouse.element.removeEventListener("DOMMouseScroll", wheelHandler);

    // ---- Hover-repel: kick tiles away from the cursor as it moves through them ----
    const REPEL_RADIUS = 140; // px around the cursor that feels the push
    const REPEL_STRENGTH = 0.006; // force per unit mass at point-blank range
    let hovering = false;
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    scene.addEventListener("mouseenter", onEnter);
    scene.addEventListener("mouseleave", onLeave);

    const repel = () => {
      // Don't fight an active drag.
      if (!hovering || mouseConstraint.body) return;
      const m = mouse.position;
      for (const b of bodies) {
        const dx = b.position.x - m.x;
        const dy = b.position.y - m.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0 || dist > REPEL_RADIUS) continue;
        const falloff = 1 - dist / REPEL_RADIUS; // 1 at the cursor, 0 at the edge
        const f = REPEL_STRENGTH * falloff * b.mass;
        Matter.Body.applyForce(b, b.position, {
          x: (dx / dist) * f,
          y: (dy / dist) * f,
        });
      }
    };

    // ---- Sync DOM tiles to physics bodies every frame ----
    const MAX_SPEED = 16; // keep a single hover from launching tiles across the section
    const sync = () => {
      repel();
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const speed = Math.hypot(b.velocity.x, b.velocity.y);
        if (speed > MAX_SPEED) {
          const s = MAX_SPEED / speed;
          Matter.Body.setVelocity(b, {
            x: b.velocity.x * s,
            y: b.velocity.y * s,
          });
        }
        const el = tilesRef.current[i];
        if (!el) continue;
        el.style.transform = `translate3d(${b.position.x - tile / 2}px, ${
          b.position.y - tile / 2
        }px, 0) rotate(${b.angle}rad)`;
      }
    };
    Matter.Events.on(engine, "afterUpdate", sync);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // ---- Hold the tiles until the section scrolls into view, then let them fall ----
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (!reduceMotion) engine.gravity.y = 1;
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(scene);

    // ---- Keep boundaries in sync on resize ----
    const ro = new ResizeObserver(() => {
      const w = scene.clientWidth;
      const h = scene.clientHeight;
      if (w === width && h === height) return;
      width = w;
      height = h;
      Matter.Composite.remove(engine.world, walls);
      walls = makeWalls();
      Matter.Composite.add(engine.world, walls);
      // Nudge any tile that fell outside the new bounds back into view.
      for (const b of bodies) {
        if (b.position.x > width || b.position.y > height) {
          Matter.Body.setPosition(b, {
            x: Math.min(b.position.x, width - tile),
            y: Math.min(b.position.y, height - tile),
          });
        }
      }
    });
    ro.observe(scene);

    return () => {
      io.disconnect();
      ro.disconnect();
      scene.removeEventListener("mouseenter", onEnter);
      scene.removeEventListener("mouseleave", onLeave);
      Matter.Events.off(engine, "afterUpdate", sync);
      Matter.Runner.stop(runner);
      Matter.Mouse.clearSourceEvents(mouse);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
    }
  }, []);

  return (
    <section className="relative z-10 overflow-hidden bg-[#007A55]">
      {/* depth: subtle radial + lime sheen */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(203,255,46,0.10), transparent 60%), radial-gradient(80% 80% at 50% 120%, rgba(0,0,0,0.25), transparent 60%)",
        }}
      />

      {/* Headline sits BEHIND the tiles so they can spill over it */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-6">
        <h2 className="font-serif text-center text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl">
          Every documantion 
          <br />
          turned into a lesson.
        </h2>
      </div>

      {/* Physics playground */}
      <div
        ref={sceneRef}
        className="relative z-10 h-[520px] sm:h-[600px] w-full select-none touch-none"
      >
        {ICONS.map((icon, i) => (
          <div
            key={icon.slug + i}
            ref={(el) => {
              if (el) tilesRef.current[i] = el;
            }}
            className="absolute left-0 top-0 grid place-items-center rounded-xl bg-white shadow-lg will-change-transform"
            style={{ width: 54, height: 54 }}
            title={icon.title}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill={`#${icon.hex}`}
              aria-hidden="true"
            >
              <path d={icon.path} />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}
