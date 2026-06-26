"use client"

import { FluidGradientText } from "./fluid-gradient-text"

export function FluidGradientSection() {
  return (
    <section className="relative w-full bg-[#027B55] dark:bg-[#027B55] text-white overflow-hidden">
      <div className="w-full h-[180px] sm:h-[220px] lg:h-[260px]">
        <FluidGradientText
          text="DocVid"
          svgViewBoxWidth={1400}
          svgViewBoxHeight={300}
        />
      </div>
    </section>
  )
}
