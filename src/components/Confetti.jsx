import React, { useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
// import { loadSlim } from "@tsparticles/slim";
import { loadFull } from "tsparticles";

function Confetti() {
    useEffect(() => {
        const initializeParticles = async () => {
          await initParticlesEngine(async (engine) => {
            await loadFull(engine);
          });
        };
    
        initializeParticles();
      }, []);

  const options = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fullScreen: {
        enable: true,
        zIndex: 1,
    },
    emitters: {
        position: {
          x: 50,
          y: 100
        },
        rate: {
          quantity: 5,
          delay: 0.15
        }
      },
    particles: {
      number: {
        value: 100,
      },
      color: {
        value: ["#4285F4", "#DB4437", "#0F9D58", "#5C6BC0"],
      },
      shape: {
        type: ['circle', 'square', 'triangle'],
      },
      size: {
        value: 6,
        random: true,
      },
      move: {
        decay: 0.05,
        direction: "top",
        enable: true,
        gravity: {
          enable: true
        },
        outModes: {
          top: "none",
          default: "destroy"
        },
        speed: {
          min: 50,
          max: 100
        }
      },
      opacity: {
        value: 1
      },
      rotate: {
        value: {
          min: 0,
          max: 360
        },
        direction: "random",
        animation: {
          enable: true,
          speed: 30
        }
      },
      tilt: {
        direction: "random",
        enable: true,
        value: {
          min: 0,
          max: 360
        },
        animation: {
          enable: true,
          speed: 30
        }
      },
      size: {
        value: 3,
        animation: {
          enable: true,
          startValue: "min",
          count: 1,
          speed: 16,
          sync: true
        }
      },
      roll: {
        darken: {
          enable: true,
          value: 25
        },
        enlighten: {
          enable: true,
          value: 25
        },
        enable: true,
        speed: {
          min: 5,
          max: 15
        }
      },
      wobble: {
        distance: 30,
        enable: true,
        speed: {
          min: -7,
          max: 7
        }
      },
      responsive: [
        {
          maxWidth: 1024,
          options: {
            particles: {
              move: {
                speed: {
                  min: 33,
                  max: 66
                }
              }
            }
          }
        }
      ]
    },
    preset: "confetti",
  };

  const particlesLoaded = (container) => {
    console.log(container);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full z-10">
        <Particles
            id="tsparticles"
            options={options}
            particlesLoaded={particlesLoaded}
    />
    </div>
  );
}

export default Confetti;
