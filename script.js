const exhibits = [
  {
    id: "blogging",
    title: "Rise of Blogging",
    years: "1996 - 2000",
    image:
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "wordpress",
    title: "Wordpressism",
    years: "1998 - 2004",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "myspace",
    title: "MySpacism",
    years: "2003 - 2006",
    image:
      "https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "facebook-art",
    title: "Facebook Art",
    years: "2004 - present",
    image:
      "https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "youtube",
    title: "Youtubism",
    years: "2005 - present",
    image:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "twitter",
    title: "Twitt Art",
    years: "2006 - present",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "instagram",
    title: "Instagraminism",
    years: "2010 - present",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: "tiktok",
    title: "Tiktokko",
    years: "2016 - present",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1100&q=80",
  },
];

const section = document.getElementById("h-scroll");
const track = document.getElementById("track");
const timeline = document.getElementById("timeline");
const arcPath = document.getElementById("navArc");

let maxTranslate = 0;
let sectionTop = 0;
let currentX = 0;
let targetX = 0;
let rafId = 0;
let lastActiveIndex = -1;

const dots = [];
const labels = [];
const portals = [];

function createPanels() {
  const cards = exhibits
    .map(
      (item) => `
      <article class="panel" data-id="${item.id}">
        <h2>${item.title}</h2>
        <p class="years">${item.years}</p>
        <div class="portal">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
        </div>
      </article>
    `,
    )
    .join("");

  track.innerHTML = cards;
  portals.push(...track.querySelectorAll(".portal img"));
}

function createTimeline() {
  timeline.innerHTML = "";
  dots.length = 0;
  labels.length = 0;

  exhibits.forEach((item, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to ${item.title}`);
    dot.dataset.index = String(index);

    const label = document.createElement("div");
    label.className = "dot-label";
    label.innerHTML = `${item.title}<span>${item.years}</span>`;

    dot.addEventListener("click", () => jumpTo(index));

    timeline.append(dot, label);
    dots.push(dot);
    labels.push(label);
  });

  updateArcPositions();
  setActiveDot(0);
}

function updateArcPositions() {
  const pathLength = arcPath.getTotalLength();

  dots.forEach((dot, index) => {
    const t = exhibits.length === 1 ? 0.5 : index / (exhibits.length - 1);
    const point = arcPath.getPointAtLength(pathLength * t);

    dot.style.left = `${point.x / 10}%`;
    dot.style.top = `${point.y / 2.6}%`;

    labels[index].style.left = `${point.x / 10}%`;
    labels[index].style.top = `${point.y / 2.6 + 7.5}%`;
  });
}

function resizeScene() {
  maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 24);
  sectionTop = section.getBoundingClientRect().top + window.scrollY;
  section.style.height = `${window.innerHeight + maxTranslate + window.innerHeight * 0.25}px`;
  updateArcPositions();
  syncTargetWithScroll();
}

function syncTargetWithScroll() {
  const localScroll = window.scrollY - sectionTop;
  const maxLocal = section.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, localScroll / Math.max(1, maxLocal)));
  targetX = -progress * maxTranslate;
}

function setActiveDot(index) {
  if (index === lastActiveIndex) {
    return;
  }

  dots[lastActiveIndex]?.classList.remove("active");
  dots[index]?.classList.add("active");
  lastActiveIndex = index;
}

function jumpTo(index) {
  const progress = exhibits.length === 1 ? 0 : index / (exhibits.length - 1);
  const maxLocal = section.offsetHeight - window.innerHeight;
  const targetY = sectionTop + progress * maxLocal;

  window.scrollTo({ top: targetY, behavior: "smooth" });
}

function animate() {
  currentX += (targetX - currentX) * 0.09;
  track.style.transform = `translate3d(${currentX}px, 0, 0)`;

  const progress = maxTranslate ? Math.min(1, Math.max(0, -currentX / maxTranslate)) : 0;
  const activeIndex = Math.round(progress * (exhibits.length - 1));
  setActiveDot(activeIndex);

  const viewportCenter = window.innerWidth * 0.5;
  const cards = track.querySelectorAll(".panel");
  cards.forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    const distance = (rect.left + rect.width / 2 - viewportCenter) / viewportCenter;
    const rotateY = Math.max(-11, Math.min(11, distance * 8));
    card.style.setProperty("--depth", `${32 - Math.abs(distance) * 40}px`);
    card.style.setProperty("--tilt", `${rotateY}deg`);

    if (portals[i]) {
      card.style.setProperty("--img-scale", `${1.045 + Math.abs(distance) * 0.04}`);
      card.style.setProperty("--img-x", `${distance * -12}px`);
    }
  });

  rafId = requestAnimationFrame(animate);
}

createPanels();
createTimeline();
resizeScene();
syncTargetWithScroll();

window.addEventListener("scroll", syncTargetWithScroll, { passive: true });
window.addEventListener("resize", resizeScene);

if (!rafId) {
  rafId = requestAnimationFrame(animate);
}
