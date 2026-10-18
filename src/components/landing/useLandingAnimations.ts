import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES, NOTIFS, TOASTS, TOKEN_SETS } from "./data";

gsap.registerPlugin(ScrollTrigger);

type Flavor = keyof typeof TOKEN_SETS;

const tileHTML = (key: string) => {
  const c = CATEGORIES[key];
  return `<div class="token tile" style="--tfg:${c.fg};--tbg:${c.bg}"><svg class="i"><use href="#i-${c.icon}"/></svg></div>`;
};
const tokenHTML = (flavor: Flavor, i: number) => {
  const key = TOKEN_SETS[flavor][i % 9];
  return key === "coin" ? '<div class="token coin"><span>₹</span></div>' : tileHTML(key);
};

const isCompact = () => matchMedia("(max-width: 900px)").matches;
const ENTRANCE =
  ".header > *, .line > span, .pill-row > *, .description, .cta-group > *, .award-badge, .card, .nav-arrow";

/**
 * Drives everything that moves on the landing page: the intro entrance, the 3D
 * phone, the floating tokens, the हिसाब/दोस्ती theme switch, the live
 * notifications and the scroll reveals. The markup lives in the components;
 * this hook only animates it. Everything is torn down on unmount.
 */
export default function useLandingAnimations(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as T;
    const $$ = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];

    // Without the 3D-phone hero (the home page now uses the demo hero) only the
    // How-it-works scroll story and the deep-link jump are needed; the other
    // scroll effects come from data-* attributes (useScrollFx, in App).
    if (!root.querySelector("#phone")) {
      const mm = gsap.matchMedia(root);
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", roomy: "(min-width: 901px) and (min-height: 720px)" },
        (c) => {
          const { motion, roomy } = c.conditions!;
          if (!motion) return;
          const steps = $$(".step");
          const bars = steps.map((s) => s.querySelector(".step-bar > span"));
          const dim = { opacity: 0.35, y: 30, scale: 0.94 };
          const lit = { opacity: 1, y: 0, scale: 1, duration: 0.5 };
          if (roomy) {
            // Side by side: hold the section on screen and light the steps up one by one
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: "#how-it-works .l-wrap", start: "center center", end: "+=140%", pin: true, scrub: 0.6 },
            });
            steps.forEach((s, i) => {
              tl.fromTo(s, dim, lit, i).fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 1 }, i + 0.2);
            });
          } else {
            // Stacked: each step lights up as it passes through the middle of the screen
            steps.forEach((s, i) =>
              gsap
                .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: s, start: "top 85%", end: "top 40%", scrub: 0.6 } })
                .fromTo(s, dim, lit)
                .fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0.2),
            );
          }
        },
      );
      const target = location.hash.length > 1 ? root.querySelector(location.hash) : null;
      target?.scrollIntoView({ behavior: "smooth" });
      return () => mm.revert();
    }

    const phone = $("#phone");
    const phoneStage = $("#phone-stage");
    const heroCenter = $(".hero-center");
    const berriesFG = $(".berries-container");
    const berriesBG = $(".berries-container-bg");
    const leavesBG = $(".leaves-container");
    const berries = $$(".berry");
    const leaves = $$(".leaf");
    const cards = $$<HTMLButtonElement>(".card");

    // Every listener shares one signal, so unmounting removes them all
    const listeners = new AbortController();
    const { signal } = listeners;
    const cleanups: (() => void)[] = [() => listeners.abort()];
    const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void) =>
      window.addEventListener(type, fn, { signal });
    const every = (fn: () => void, ms: number) => {
      const id = window.setInterval(fn, ms);
      cleanups.push(() => clearInterval(id));
    };

    let isSwitching = false;
    let switchSpin = 0;

    const ctx = gsap.context(() => {
      // Per-token state for the float/repel loop
      const state = berries.map((b, i) => {
        b.innerHTML = tokenHTML("hisaab", i);
        return { rx: 0, ry: 0, angle: Math.random() * 360, baseX: 0, baseY: 0, op: parseFloat(getComputedStyle(b).opacity) };
      });

      // The floating layers sit in an "orbit" box hugging the phone, and each
      // token is kept inside it, so nothing drifts over the headline or cards.
      const orbit = { w: 0, h: 0 };
      const home = berries.map(() => ({ cx: 0, cy: 0, r: 0 }));
      const layoutOrbit = () => {
        const phoneLeft = heroCenter.offsetLeft + phoneStage.offsetLeft;
        const phoneRight = phoneLeft + phoneStage.offsetWidth;
        let left = phoneLeft - 24;
        let right = phoneRight + 24;
        if (!isCompact()) {
          // Side by side: only the free strip between the copy and the cards,
          // even where the phone itself tucks under the copy on narrower screens
          const heroLeft = $(".hero-left");
          const copyRight = heroLeft.offsetLeft + heroLeft.offsetWidth;
          const cardsLeft = Math.min(...$$(".product-carousel, .side-title").map((el) => el.offsetLeft));
          left = Math.max(phoneLeft - 60, copyRight + 8);
          right = Math.min(phoneRight + 60, cardsLeft - 8);
        }
        const padY = 16;
        const box = {
          left: left + "px",
          top: heroCenter.offsetTop + phoneStage.offsetTop - padY + "px",
          width: Math.max(0, right - left) + "px",
          height: phoneStage.offsetHeight + padY * 2 + "px",
          right: "auto",
          bottom: "auto",
        };
        [berriesFG, berriesBG, leavesBG].forEach((el) => Object.assign(el.style, box));
        orbit.w = berriesFG.clientWidth;
        orbit.h = berriesFG.clientHeight;
        // The logo marks need some room around the phone; drop them when it's tight
        leavesBG.style.display = orbit.w < 320 ? "none" : "";
        berries.forEach((b, i) => {
          // The visible token is the middle ~38% of its slot; 12px spare for parallax
          home[i] = { cx: b.offsetLeft + b.offsetWidth / 2, cy: b.offsetTop + b.offsetHeight / 2, r: b.offsetWidth * 0.19 + 12 };
        });
      };
      const clampTo = (v: number, centre: number, r: number, size: number) =>
        size < r * 2 ? size / 2 - centre : Math.min(Math.max(v, r - centre), size - r - centre);
      const clampX = (i: number, x: number) => clampTo(x, home[i].cx, home[i].r, orbit.w);
      const clampY = (i: number, y: number) => clampTo(y, home[i].cy, home[i].r, orbit.h);

      // Fit the 300×640 phone into whatever space the stage has
      const fitPhone = () => {
        const host = phoneStage.parentElement!;
        const s = Math.min(1, (host.clientHeight * 0.86) / 640, (host.clientWidth * 0.8) / 300);
        phoneStage.style.setProperty("--ps", s.toFixed(3));
        phoneStage.style.width = 300 * s + "px";
        phoneStage.style.height = 640 * s + "px";
        layoutOrbit();
      };
      fitPhone();
      // Also re-fit when the copy above the phone reflows (fonts loading, etc.)
      const ro = new ResizeObserver(fitPhone);
      ro.observe(root.querySelector(".hero-content")!);
      cleanups.push(() => ro.disconnect());

      // ---------- Phone boot: splash (logo) screen -> Home dashboard ----------
      let bootTl: gsap.core.Timeline | null = null;
      const showSplash = () => {
        bootTl?.kill();
        gsap.set(".view-splash .s-body > *, .view-splash .s-foot, .view-dash > *", { clearProps: "opacity,transform" });
        // A push notification belongs to the Home screen — never leave one over the splash
        gsap.to(".p-notif", { yPercent: 25, scale: 0.85, opacity: 0, duration: 0.25, overwrite: true });
        phone.dataset.screen = "splash";
      };
      const countUp = () => {
        $$("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const prefix = el.dataset.prefix || "";
          const o = { v: 0 };
          gsap.to(o, {
            v: end,
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = prefix + Math.round(o.v).toLocaleString("en-IN");
            },
          });
        });
      };
      const bootPhone = (delay = 1.6) => {
        showSplash();
        bootTl = gsap
          .timeline({ delay })
          .to(".view-splash .s-body > *, .view-splash .s-foot", { y: -16, opacity: 0, stagger: 0.05, duration: 0.35, ease: "power2.in" })
          .add(() => {
            phone.dataset.screen = "dash";
          })
          .fromTo(".view-dash > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.55, ease: "power3.out" })
          .add(countUp, "<0.15");
      };

      // ---------- हिसाब / दोस्ती switch ----------
      const switchFlavor = (flavor: Flavor) => {
        if (isSwitching) return;
        isSwitching = true;

        const target = flavor === "dosti" ? { mid: "#e0f8ec", outer: "#b3ebd0" } : { mid: "#e4eeff", outer: "#bcd3fb" };
        gsap.to(root, { "--bg-mid": target.mid, "--bg-outer": target.outer, duration: 1.5, ease: "power2.inOut" });

        // Phone spin (swap screen at peak, settle to 720)
        const spin = { val: 0 };
        const paint = () => {
          switchSpin = spin.val;
        };
        gsap.to(spin, {
          val: 360,
          duration: 0.6,
          ease: "power2.in",
          onUpdate: paint,
          onComplete: () => {
            root.classList.toggle("green-theme", flavor === "dosti");
            showSplash();
            gsap.to(spin, {
              val: 720,
              duration: 1.5,
              ease: "back.out(0.7)",
              onUpdate: paint,
              onComplete: () => {
                switchSpin = 0;
                bootPhone(0.9);
              },
            });
          },
        });

        // Tokens get sucked into the phone, swap, and pop back out somewhere new
        const pr = phoneStage.getBoundingClientRect();
        const phoneCx = pr.left + pr.width / 2;
        const phoneCy = pr.top + pr.height / 2;
        let done = 0;
        berries.forEach((berry, i) => {
          const s = state[i];
          const parent = (berry.offsetParent as HTMLElement).getBoundingClientRect();
          const centerX = phoneCx - (parent.left + berry.offsetLeft + berry.offsetWidth / 2);
          const centerY = phoneCy - (parent.top + berry.offsetTop + berry.offsetHeight / 2);
          const nextX = clampX(i, (Math.random() - 0.5) * 80);
          const nextY = clampY(i, (Math.random() - 0.5) * 80);

          gsap.set(berry, { rotation: s.angle, x: s.baseX, y: s.baseY });
          gsap
            .timeline()
            .to(berry, {
              x: centerX,
              y: centerY,
              rotation: s.angle + 45,
              scale: 0.1,
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                berry.innerHTML = tokenHTML(flavor, i);
                heroCenter.style.zIndex = "50";
              },
            })
            .to(berry, { duration: 0.3 })
            .to(berry, {
              onStart: () => {
                heroCenter.style.zIndex = "1";
              },
              x: nextX,
              y: nextY,
              rotation: s.angle + 90,
              scale: 1,
              opacity: s.op,
              duration: 0.9,
              ease: "back.out(1.5)",
              onComplete: () => {
                Object.assign(s, { angle: s.angle + 90, baseX: nextX, baseY: nextY, rx: 0, ry: 0 });
                if (++done === berries.length) isSwitching = false;
              },
            });
        });
      };

      // Auto-play between flavors until the visitor picks one themselves
      const AUTO_MS = 12000;
      let autoTimer = 0;
      let userPicked = false;
      cleanups.push(() => clearTimeout(autoTimer));
      const armAutoplay = () => {
        clearTimeout(autoTimer);
        cards.forEach((c) => c.classList.remove("autoplay"));
        if (userPicked) return;
        const active = $(".card.active");
        void active.offsetWidth; // restart the progress bar animation
        active.style.setProperty("--auto-ms", AUTO_MS + "ms");
        active.classList.add("autoplay");
        autoTimer = window.setTimeout(() => {
          // Don't flip themes while the hero is off screen or the tab is hidden
          if (document.hidden || isSwitching || window.scrollY > window.innerHeight * 0.6) return armAutoplay();
          step(1, true);
        }, AUTO_MS);
      };
      const activate = (card: HTMLButtonElement, auto = false) => {
        if (!auto) userPicked = true;
        if (isSwitching || card.classList.contains("active")) return armAutoplay();
        cards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        switchFlavor(card.dataset.flavor as Flavor);
        armAutoplay();
      };
      const step = (dir: number, auto = false) => {
        const idx = cards.findIndex((c) => c.classList.contains("active"));
        activate(cards[(idx + dir + cards.length) % cards.length], auto);
      };
      cards.forEach((card) => card.addEventListener("click", () => activate(card), { signal }));
      $$(".nav-arrow").forEach((btn) => btn.addEventListener("click", () => step(Number(btn.dataset.dir)), { signal }));

      // ---------- Gentle pointer parallax + token repel ----------
      const mouse = { x: 0, y: 0, px: -9999, py: -9999 };
      const smooth = { x: 0, y: 0 };
      listen("pointermove", (e) => {
        mouse.x = e.clientX / window.innerWidth - 0.5;
        mouse.y = e.clientY / window.innerHeight - 0.5;
        mouse.px = e.clientX;
        mouse.py = e.clientY;
      });

      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        const time = Date.now() * 0.001;
        smooth.x += (mouse.x - smooth.x) * 0.05;
        smooth.y += (mouse.y - smooth.y) * 0.05;

        // Nothing below is visible once the hero has scrolled away
        if (window.scrollY > window.innerHeight * 1.2) return;

        phone.style.transform = `rotateY(${smooth.x * 14 + switchSpin}deg) rotateX(${-smooth.y * 7}deg)`;
        berriesFG.style.transform = `translate(${smooth.x * 8}px, ${smooth.y * 8}px)`;
        berriesBG.style.transform = `translate(${smooth.x * -5}px, ${smooth.y * -5}px)`;
        leavesBG.style.transform = `translate(${smooth.x * -3}px, ${smooth.y * -3}px)`;

        if (!isSwitching) {
          berries.forEach((berry, i) => {
            const s = state[i];
            const r = berry.getBoundingClientRect();
            const dx = mouse.px - (r.left + r.width / 2);
            const dy = mouse.py - (r.top + r.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            let tx = 0;
            let ty = 0;
            let speed = 1;
            if (dist < 250 && dist > 0) {
              const force = (250 - dist) / 250;
              tx = (dx / dist) * force * -20;
              ty = (dy / dist) * force * -20;
              speed = 1 + force * 1.5;
            }
            s.rx += (tx - s.rx) * 0.1;
            s.ry += (ty - s.ry) * 0.1;
            s.angle += 0.08 * speed;

            const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9];
            const phase = (time + i * 0.7) * ((Math.PI * 2) / dur);
            const floatY = Math.sin(phase) * 15;
            const floatAngle = Math.cos(phase) * 6;
            const x = clampX(i, s.rx + s.baseX);
            const y = clampY(i, s.ry + s.baseY + floatY);
            berry.style.transform = `translate(${x}px, ${y}px) rotate(${s.angle + floatAngle}deg)`;
            const tok = berry.firstElementChild as HTMLElement | null;
            if (tok) tok.style.rotate = `${-s.angle}deg`;
          });
        }

        leaves.forEach((leaf, i) => {
          const dur = 10 + i * 2;
          const phase = (time + i * 1.2) * ((Math.PI * 2) / dur);
          leaf.style.transform = `translate(${Math.cos(phase * 0.5) * 6}px, ${Math.sin(phase) * 20}px) rotate(${Math.sin(phase * 0.3) * 15}deg)`;
        });
      };
      raf = requestAnimationFrame(frame);
      cleanups.push(() => cancelAnimationFrame(raf));

      // ---------- Live loops: push notification + floating toasts ----------
      const startLoops = () => {
        const notif = $(".p-notif");
        const bell = $(".d-bell");
        let n = 0;
        gsap.set(notif, { yPercent: 25, scale: 0.85, opacity: 0 });
        const showNotif = () => {
          if (document.hidden || phone.dataset.screen !== "dash") return;
          const [t, s] = NOTIFS[n++ % NOTIFS.length];
          notif.querySelector("[data-n-t]")!.textContent = t;
          notif.querySelector("[data-n-s]")!.textContent = s;
          gsap
            .timeline()
            .to(notif, { yPercent: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" })
            .to(bell, { rotation: 16, transformOrigin: "50% 10%", yoyo: true, repeat: 5, duration: 0.07 }, "<0.15")
            .set(bell, { rotation: 0 })
            .to(notif, { yPercent: 25, scale: 0.85, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=3.2");
        };
        showNotif();
        every(showNotif, 6000);

        (["t1", "t2"] as const).forEach((k, ti) => {
          const el = $("." + k);
          let i = 0;
          gsap.set(el, { transformPerspective: 600 });
          gsap.to(el, { y: ti ? 12 : -12, duration: 2.4 + ti * 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
          const cycle = () => {
            gsap
              .timeline({ delay: 3.6 + ti * 1.7, onComplete: cycle })
              .to(el, { rotationX: 90, opacity: 0, duration: 0.35, ease: "power2.in" })
              .add(() => {
                i++;
                const [cat, t, s] = TOASTS[k][i % TOASTS[k].length];
                const c = CATEGORIES[cat];
                const icon = el.querySelector<HTMLElement>(".ft-ic")!;
                icon.innerHTML = `<svg class="i"><use href="#i-${c.icon}"/></svg>`;
                icon.style.color = c.fg;
                icon.style.background = c.bg;
                el.querySelector("[data-t]")!.textContent = t;
                el.querySelector("[data-s]")!.textContent = s;
              })
              .to(el, { rotationX: 0, opacity: 1, duration: 0.55, ease: "back.out(2)" });
          };
          cycle();
        });
      };

      // "Split bills" rolls to "Keep friendship" and back, forever
      const startRoller = () => {
        const rolls = $$(".main-title .roll");
        const offset = (_: number, el: HTMLElement) =>
          -((el.children[1] as HTMLElement).offsetTop - (el.children[0] as HTMLElement).offsetTop);
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 1.8, onRepeat: () => void tl.invalidate() });
        tl.to(rolls, { y: offset, duration: 0.9, ease: "expo.inOut", stagger: 0.12 }).to(
          rolls,
          { y: 0, duration: 0.9, ease: "expo.inOut", stagger: 0.12 },
          "+=2.4",
        );
      };

      // Sections below the hero rise in as they scroll into view
      const startReveals = () => {
        gsap.set(".reveal", { y: 20, opacity: 0 });
        ScrollTrigger.batch(".reveal", {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "power2.out", clearProps: "transform" }),
        });
      };

      // Deep links like /#faq land on their section once the page is ready
      const jumpToHash = () => {
        const target = location.hash.length > 1 ? root.querySelector(location.hash) : null;
        target?.scrollIntoView({ behavior: "smooth" });
      };

      // ---------- Intro: quick staggered entrance ----------

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        phone.dataset.screen = "dash";
        startLoops();
        jumpToHash();
        return;
      }

      startReveals();

      const intro = () => {
        const compact = isCompact();
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(phoneStage, { y: 40, opacity: 0, duration: 0.8 })
          .addLabel("copy", 0);

        tl.from(".header > *", { y: -12, opacity: 0, stagger: 0.05, duration: 0.5 }, "copy")
          .from(".hero .line > span", { yPercent: 100, duration: 0.7, stagger: 0.08 }, "copy+=0.1")
          .from(".pill-row > *, .description, .cta-group > *, .award-badge", { y: 16, opacity: 0, stagger: 0.05, duration: 0.5 }, "copy+=0.2")
          .from(".card", { x: 24, opacity: 0, stagger: 0.08, duration: 0.6 }, "copy+=0.3")
          .from(".nav-arrow", { opacity: 0, duration: 0.4 }, "copy+=0.5")
          .from(".token", { scale: 0, duration: 0.6, stagger: 0.04 }, "copy+=0.4")
          .from(".leaf", { opacity: 0, duration: 0.8, stagger: 0.06 }, "copy+=0.3")
          .from(".float-toast", { y: 10, opacity: 0, duration: 0.5, stagger: 0.15 }, "copy+=0.6")
          .add(() => {
            bootPhone(compact ? 0.3 : 0.6);
            startLoops();
            armAutoplay();
          }, "copy+=0.5")
          .add(() => {
            gsap.set(ENTRANCE, { clearProps: "opacity,transform" });
          })
          .add(startRoller)
          .add(() => ScrollTrigger.refresh())
          .add(jumpToHash);
      };

      // Wait for fonts (max 1.2s) so the headline masks measure the real glyphs
      let cancelled = false;
      cleanups.push(() => {
        cancelled = true;
      });
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(() => {
        if (!cancelled) ctx.add(intro);
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [rootRef]);
}
