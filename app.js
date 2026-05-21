const topbar = document.getElementById("topbar");
const navToggle = document.getElementById("navToggle");
const progressLine = document.getElementById("progressLine");
const revealItems = document.querySelectorAll(".reveal");
const tabs = document.querySelectorAll(".tab");
const tabCopy = document.getElementById("tabCopy");
const panels = document.querySelectorAll("[data-panel]");
const runDemo = document.getElementById("runDemo");
const resetDemo = document.getElementById("resetDemo");
const demoStatus = document.getElementById("demoStatus");
const transcriptFeed = document.getElementById("transcriptFeed");
const noteFeed = document.getElementById("noteFeed");
const aiFeed = document.getElementById("aiFeed");

const tabData = {
    transcript: {
        title: "ถอดความแบบสด และแก้ไขได้ระหว่างประชุม",
        body: "ระบบแบ่งเสียงเป็นช่วง ตรวจ silence และส่งให้ AI worker ถอดความแบบต่อเนื่อง พร้อมสถานะ AI listening บนหน้าจอ"
    },
    note: {
        title: "Notebook ที่เชื่อมกับเวลาของเสียง",
        body: "โน้ต rich text สามารถแทรก timestamp, แนบ snapshot และคลิกย้อน audio range ไปยังช่วงเวลาที่เกี่ยวข้องได้"
    },
    ai: {
        title: "AI ที่ใช้บริบทจริงก่อนตอบ",
        body: "AI Assistant รวม transcript, notebook, chapter summary และภาพในโน้ต เพื่อสรุป MoM, action items และตอบคำถามเฉพาะจุด"
    }
};

const demoScript = [
    {
        delay: 300,
        status: "Listening to meeting audio",
        target: transcriptFeed,
        html: "<strong>00:02 · Project Lead</strong><br>วันนี้เราจะสรุปงบ Q2 และ roadmap ไตรมาสหน้า"
    },
    {
        delay: 1350,
        status: "Notebook timestamp created",
        target: noteFeed,
        html: "<strong>00:02 · Opening</strong><br>สรุปงบ Q2 และ roadmap ไตรมาสถัดไป"
    },
    {
        delay: 2350,
        status: "Smart silence bypass",
        target: transcriptFeed,
        html: "<strong>00:08 · Silence</strong><br>ข้ามช่วงเงียบ ไม่ส่ง API โดยไม่จำเป็น"
    },
    {
        delay: 3400,
        status: "Capturing action item",
        target: transcriptFeed,
        html: "<strong>00:16 · Finance Lead</strong><br>ขอให้ส่ง budget report ให้ Director ภายในวันศุกร์"
    },
    {
        delay: 4550,
        status: "Notebook synced",
        target: noteFeed,
        html: "<strong>00:16 · Action Item</strong><br>Finance owner: ส่ง budget report ภายในวันศุกร์"
    },
    {
        delay: 5850,
        status: "AI summary ready",
        target: aiFeed,
        html: "<strong>AI Output</strong><br>พบ 1 decision, 2 follow-ups และ 1 deadline พร้อม timestamp อ้างอิง"
    }
];

let demoTimers = [];

function updateTopbar() {
    topbar.classList.toggle("scrolled", window.scrollY > 24);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll <= 0 ? 0 : (window.scrollY / maxScroll) * 100;
    progressLine.style.width = `${progress}%`;
}

function setActiveTab(tabName) {
    const copy = tabData[tabName];
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabName));
    panels.forEach((panel) => panel.classList.toggle("is-focused", panel.dataset.panel === tabName));
    tabCopy.innerHTML = `<h3>${copy.title}</h3><p>${copy.body}</p>`;
}

function addFeedItem(target, html) {
    const item = document.createElement("div");
    item.className = "feed-item";
    item.innerHTML = html;
    target.appendChild(item);
}

function resetDemoState() {
    demoTimers.forEach((timer) => clearTimeout(timer));
    demoTimers = [];
    transcriptFeed.innerHTML = "";
    noteFeed.innerHTML = "";
    aiFeed.innerHTML = "";
    demoStatus.textContent = "Ready";
    runDemo.disabled = false;
}

function startDemo() {
    resetDemoState();
    runDemo.disabled = true;
    demoStatus.textContent = "Starting";

    demoScript.forEach((step, index) => {
        const timer = setTimeout(() => {
            demoStatus.textContent = step.status;
            addFeedItem(step.target, step.html);
            if (index === demoScript.length - 1) {
                runDemo.disabled = false;
                demoStatus.textContent = "Summary ready";
            }
        }, step.delay);
        demoTimers.push(timer);
    });
}

window.addEventListener("scroll", updateTopbar, { passive: true });
window.addEventListener("load", updateTopbar);

navToggle.addEventListener("click", () => {
    const open = !topbar.classList.contains("open");
    topbar.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
        topbar.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));
tabs.forEach((tab) => tab.addEventListener("click", () => setActiveTab(tab.dataset.tab)));
runDemo.addEventListener("click", startDemo);
resetDemo.addEventListener("click", resetDemoState);
setActiveTab("transcript");
