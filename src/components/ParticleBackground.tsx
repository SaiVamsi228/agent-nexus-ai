import { useEffect, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export const ParticleBackground = () => {
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      particles: {
        color: {
          value: ["#fecaca", "#f87171", "#ef4444"],
        },
        links: {
          color: "#fecaca",
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: true,
          speed: 0.5,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 30,
        },
        opacity: {
          value: 0.3,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="absolute inset-0 -z-10"
    />
  );
};
