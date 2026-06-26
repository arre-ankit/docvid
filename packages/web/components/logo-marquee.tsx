import {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siPython,
  siGo,
  siRust,
  siNodedotjs,
  siTailwindcss,
  siGraphql,
  siVuedotjs,
  siSvelte,
  siDocker,
  siPostgresql,
  siDjango,
  siKotlin,
  siSwift,
  siRedis,
  type SimpleIcon,
} from "simple-icons";

/* The stacks shown spinning across the reel. */
const ITEMS: SimpleIcon[] = [
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siPython,
  siGo,
  siRust,
  siNodedotjs,
  siTailwindcss,
  siGraphql,
  siVuedotjs,
  siSvelte,
  siDocker,
  siPostgresql,
  siDjango,
  siKotlin,
  siSwift,
  siRedis,
];

function Cell({ icon }: { icon: SimpleIcon }) {
  return (
    <div className="flex w-40 shrink-0 flex-col items-center justify-center gap-3 border-r border-border/60 py-9 sm:w-52">
      <svg
        role="img"
        viewBox="0 0 24 24"
        aria-label={icon.title}
        className="h-9 w-9 fill-foreground/85 transition-colors"
      >
        <path d={icon.path} />
      </svg>
      <span className="text-sm font-medium text-muted-foreground">
        {icon.title}
      </span>
    </div>
  );
}

/**
 * An infinite, slot-machine-style reel of tech logos. The list is rendered
 * twice and the track translates by -50%, so the loop is seamless. Pauses on
 * hover and respects reduced-motion.
 */
export function LogoMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-border/60">
      <div className="flex w-max animate-logo-reel">
        {[...ITEMS, ...ITEMS].map((icon, i) => (
          <Cell key={`${icon.title}-${i}`} icon={icon} />
        ))}
      </div>

      {/* edge blur so cells dissolve in/out instead of hard-cutting */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 backdrop-blur-md [mask-image:linear-gradient(to_right,black,transparent)] sm:w-36" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 backdrop-blur-md [mask-image:linear-gradient(to_left,black,transparent)] sm:w-36" />
    </div>
  );
}
