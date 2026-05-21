/* app.js */
/**
 * HEARJOT LANDING PAGE — Core Interactive Engine
 * White + Blue Theme · Scroll Animations · 3-Panel Simulator · FAQ
 * Developed by WakeUpz @MFEC ios-Data Team
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. NAVBAR — Scroll Shrink
    // ============================================================
    const navHeader = document.getElementById('navHeader');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        if (currentY > 50) {
            navHeader.classList.add('scrolled');
        } else {
            navHeader.classList.remove('scrolled');
        }
        lastScrollY = currentY;
    }, { passive: true });


    // ============================================================
    // 2. SCROLL REVEAL — IntersectionObserver
    // ============================================================
    const animEls = document.querySelectorAll('[data-animate]:not([data-animate="float"])');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings in same parent
                const siblings = [...entry.target.parentElement.querySelectorAll('[data-animate]:not(.visible)')];
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    animEls.forEach(el => observer.observe(el));


    // ============================================================
    // 3. FAQ ACCORDION
    // ============================================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');

        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all
            faqItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector('.faq-a').style.maxHeight = null;
            });

            // Open clicked
            if (!isOpen) {
                item.classList.add('open');
                a.style.maxHeight = a.scrollHeight + 'px';
            }
        });
    });


    // ============================================================
    // 4. INTERACTIVE 3-PANEL WORKSPACE SIMULATOR
    // ============================================================

    // --- DOM refs ---
    const awStartBtn      = document.getElementById('awStartBtn');
    const awResetBtn      = document.getElementById('awResetBtn');
    const awStatus        = document.getElementById('awStatus');
    const awScrollToggle  = document.getElementById('awScrollToggle');

    // Header elements
    const awPlaceholder   = document.getElementById('awPlaceholder');
    const awFileBadge     = document.getElementById('awFileBadge');
    const awMicChip       = document.getElementById('awMicChip');
    const awMicIcon       = document.getElementById('awMicIcon');
    const awTeamsText     = document.getElementById('awTeamsText');
    const awBars          = [
        document.getElementById('aw-b1'),
        document.getElementById('aw-b2'),
        document.getElementById('aw-b3'),
    ];

    // Panel bodies
    const awTranscript     = document.getElementById('awTranscript');
    const awTranscriptEmpty = awTranscript.querySelector('.aw-empty');
    const awNotebook       = document.getElementById('awNotebook');
    const awNotebookEmpty  = awNotebook.querySelector('.aw-empty');
    const awChat           = document.getElementById('awChat');
    const awChatWelcome    = document.getElementById('awChatWelcome');

    // Chat controls
    const awChatInput  = document.getElementById('awChatInput');
    const awChatSend   = document.getElementById('awChatSend');
    const awClearChat  = document.getElementById('awClearChat');
    const awCollapsePanel = document.getElementById('awCollapsePanel');
    const awPanel3     = document.getElementById('awPanel3');
    const awPanels     = document.getElementById('awPanels');

    // --- State ---
    let simRunning      = false;
    let autoScrollPaused = false;
    let panelCollapsed  = false;
    let timers          = [];
    let micBarInterval  = null;
    let typeInterval    = null;
    let chatMemory      = 0;

    // --- Simulation script ---
    const simScript = [
        {
            delay: 800,
            type: 'sys',
            text: '🛡️ ยืนยันสิทธิ์ Microphone และ Screen Capture สำเร็จ (macOS Sandbox)'
        },
        {
            delay: 1800,
            type: 'sys',
            text: '🎤 Teams Sync เปิดใช้งาน — รับสัญญาณเสียงสองช่องพร้อมกัน'
        },
        {
            delay: 3000,
            type: 'speech',
            speaker: 'คุณสมยศ (Project Lead)',
            ts: '00:02',
            text: 'สวัสดีครับ วันนี้ประชุมสรุปงบ Q2 และ Roadmap ไตรมาสถัดไปของแผนก ขอให้ทุกคนช่วยสรุปประเด็นด้วยนะครับ',
            note: {
                ts: '00:02',
                text: '<strong>เปิดประชุม:</strong> สรุปงบ Q2 และ Roadmap ไตรมาสถัดไป'
            }
        },
        {
            delay: 11000,
            type: 'speech',
            speaker: 'คุณอัญชลี (Finance Lead)',
            ts: '00:09',
            text: 'งบ Q2 เราใช้ไป 82% จากที่วางแผนไว้ ส่วนที่เหลือแนะนำย้ายไป Q3 เพื่อรองรับโปรเจกต์ AI Automation ค่ะ',
            note: {
                ts: '00:09',
                text: '<strong>งบ Q2:</strong> ใช้ไป 82% · แนะนำย้าย 18% ที่เหลือ → Q3 เพื่อ AI Automation'
            }
        },
        {
            delay: 21000,
            type: 'silence',
            ts: '00:14',
            text: '🔇 [Smart Silence Bypass] RMS = 0.0008 &lt; 0.005 — ข้ามช่วงเงียบ 4 วินาที ประหยัด API Token ได้ทันที'
        },
        {
            delay: 24500,
            type: 'speech',
            speaker: 'คุณสมยศ (Project Lead)',
            ts: '00:16',
            text: 'โอเคครับ ขอให้อัญชลีทำ Report สรุปงบให้เสร็จภายในวันศุกร์นี้นะครับ แล้วส่งให้ทีม Director ตรวจสอบ',
            note: {
                ts: '00:16',
                text: '<strong>Action Item:</strong> คุณอัญชลี → ส่ง Budget Report ภายในวันศุกร์'
            }
        },
        {
            delay: 33000,
            type: 'sys',
            text: '✅ การประชุมสิ้นสุด — ทรานสคริปต์ครบถ้วน พร้อมเปิดใช้ AI Assistant แล้ว'
        }
    ];

    // --- Helper: Smooth scroll panel ---
    function scrollBottom(el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }

    // --- Helper: Create element ---
    function el(tag, cls, html = '') {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    // --- Append system log to transcript ---
    function addSysLog(text) {
        const log = el('div', 'sim-system-log');
        log.innerHTML = `<i class="fas fa-circle-info" style="color:var(--text-light);font-size:9px"></i> ${text}`;
        awTranscript.appendChild(log);
        if (!autoScrollPaused) scrollBottom(awTranscript);
    }

    // --- Append silence bypass ---
    function addSilenceBypass(text) {
        const s = el('div', 'sim-silence-bypass');
        s.innerHTML = `<i class="fas fa-volume-xmark"></i> <strong>Smart Silence Bypass:</strong> ${text}`;
        awTranscript.appendChild(s);
        if (!autoScrollPaused) scrollBottom(awTranscript);
    }

    // --- Typewriter effect ---
    function typeText(container, text, onDone) {
        let i = 0;
        const cursor = el('span', 'typing-cursor');
        container.appendChild(cursor);

        typeInterval = setInterval(() => {
            if (i < text.length) {
                cursor.insertAdjacentText('beforebegin', text[i++]);
                if (!autoScrollPaused) scrollBottom(awTranscript);
            } else {
                clearInterval(typeInterval);
                typeInterval = null;
                cursor.remove();
                if (onDone) onDone();
            }
        }, 22);
    }

    // --- Add notebook note ---
    function addNote(noteData) {
        // Header if first note
        if (!awNotebook.querySelector('.sim-note-header')) {
            const h = el('div', 'sim-note-header');
            h.innerHTML = '<i class="fas fa-book-open" style="color:var(--blue)"></i> สรุปการประชุม Q2 Review';
            awNotebook.appendChild(h);
        }

        const note = el('div', 'sim-note');
        const badge = el('span', 'sim-note-ts');
        badge.innerHTML = `<i class="fas fa-play"></i> ${noteData.ts}`;
        badge.title = 'คลิกเพื่อย้อนฟังเสียง ณ ช่วงนี้';
        badge.addEventListener('click', () => {
            badge.style.background = 'var(--blue)';
            badge.style.color = '#fff';
            const info = el('div', 'sim-system-log');
            info.innerHTML = `<i class="fas fa-headphones" style="color:var(--blue)"></i> ย้อนเล่นเสียงไปที่ <strong>${noteData.ts}</strong> — Audio Player เลื่อน Seek ไปแล้ว`;
            awTranscript.appendChild(info);
            if (!autoScrollPaused) scrollBottom(awTranscript);
        });

        const text = el('div');
        text.style.fontSize = '10.5px';
        text.style.color = 'var(--text-sub)';
        text.style.lineHeight = '1.55';
        text.innerHTML = noteData.text;

        note.appendChild(badge);
        note.appendChild(text);
        awNotebook.appendChild(note);
        scrollBottom(awNotebook);
    }

    // --- Mic bar animation ---
    function startMicAnim() {
        const heights = [
            [3, 10, 5], [6, 14, 8], [2, 7, 4],
            [8, 14, 10], [4, 12, 6], [10, 14, 8],
        ];
        let hIdx = 0;
        micBarInterval = setInterval(() => {
            if (!simRunning) return;
            const h = heights[hIdx % heights.length];
            awBars.forEach((b, i) => {
                b.style.height = h[i] + 'px';
            });
            hIdx++;
        }, 100);
    }

    function stopMicAnim() {
        if (micBarInterval) {
            clearInterval(micBarInterval);
            micBarInterval = null;
        }
        awBars.forEach(b => b.style.height = '');
    }

    // --- Pause scroll toggle ---
    awScrollToggle.addEventListener('click', () => {
        autoScrollPaused = !autoScrollPaused;
        if (autoScrollPaused) {
            awScrollToggle.classList.add('paused');
            awScrollToggle.title = 'เปิดเลื่อนหน้าจออัตโนมัติ';
            addSysLog('🖐️ Pause Auto-Scroll เปิดแล้ว — หน้าจอจะไม่เลื่อนขณะมีข้อความใหม่');
        } else {
            awScrollToggle.classList.remove('paused');
            awScrollToggle.title = 'Pause Auto-Scroll';
            addSysLog('🔄 Auto-Scroll กลับมาทำงาน — จะเลื่อนตามข้อความใหม่อัตโนมัติ');
            scrollBottom(awTranscript);
        }
    });

    // --- Collapse AI Panel ---
    awCollapsePanel.addEventListener('click', () => {
        panelCollapsed = !panelCollapsed;
        if (panelCollapsed) {
            awPanel3.style.display = 'none';
            awPanels.style.gridTemplateColumns = '1.5fr 1.5fr';
            awCollapsePanel.innerHTML = '<i class="fas fa-chevron-left"></i>';
            awCollapsePanel.title = 'ขยายแผง AI';
            addSysLog('📐 ย่อแผง AI Assistant แล้ว — พื้นที่ Notebook เพิ่มขึ้น');
        } else {
            awPanel3.style.display = 'flex';
            awPanels.style.gridTemplateColumns = 'repeat(3, 1fr)';
            awCollapsePanel.innerHTML = '<i class="fas fa-chevron-right"></i>';
            awCollapsePanel.title = 'ย่อแผง AI';
            addSysLog('🤖 ขยายแผง AI Assistant กลับมาแล้ว');
        }
    });

    // --- Clear chat ---
    awClearChat.addEventListener('click', () => {
        awChat.innerHTML = `
            <div class="aw-chat-welcome" id="awChatWelcome">
                <div class="aw-welcome-icon"><i class="fas fa-sparkles"></i></div>
                <h4>AI Co-Pilot พร้อมแล้ว</h4>
                <p>เริ่มประชุมก่อน แล้วถาม AI ได้เลยค่ะ</p>
            </div>
        `;
        awChatInput.disabled = true;
        awChatInput.value = '';
        awChatSend.disabled = true;
        chatMemory = 0;
        addSysLog('🧹 ล้างประวัติแชท AI — หน่วยความจำรีเซ็ตเป็น 0/20');
    });

    // --- Start Simulator ---
    function startSim() {
        if (simRunning) return;
        simRunning = true;

        awStartBtn.disabled = true;
        awResetBtn.disabled = false;
        awStatus.textContent = 'สถานะ: กำลังบันทึก...';

        // Show file badge
        awPlaceholder.style.display = 'none';
        awFileBadge.style.display = 'flex';

        // Activate mic
        awMicChip.classList.remove('muted');
        awMicChip.classList.add('active');
        awMicIcon.className = 'fas fa-microphone';
        awTeamsText.style.display = 'inline';
        startMicAnim();

        // Hide empty states
        awTranscriptEmpty.style.display = 'none';
        awNotebookEmpty.style.display = 'none';

        // Run timeline
        simScript.forEach(evt => {
            const t = setTimeout(() => {
                if (evt.type === 'sys') {
                    awStatus.textContent = 'สถานะ: บันทึกสดอยู่...';
                    addSysLog(evt.text);
                }

                else if (evt.type === 'silence') {
                    addSilenceBypass(evt.text);
                }

                else if (evt.type === 'speech') {
                    // Create segment
                    const seg = el('div', 'sim-segment');
                    seg.innerHTML = `
                        <div class="sim-time">
                            <i class="fas fa-user-circle"></i>
                            ${evt.speaker} <span style="opacity:0.6">[${evt.ts}]</span>
                        </div>
                        <div class="sim-text"></div>
                    `;
                    awTranscript.appendChild(seg);

                    const textEl = seg.querySelector('.sim-text');
                    typeText(textEl, evt.text, () => {
                        // After typing done, add notebook note
                        if (evt.note) addNote(evt.note);
                    });
                }
            }, evt.delay);
            timers.push(t);
        });

        // Finish
        const finishTimer = setTimeout(() => {
            awStatus.textContent = 'สถานะ: เสร็จสิ้น ✓';

            // Stop mic
            awMicChip.classList.remove('active');
            awMicChip.classList.add('muted');
            awMicIcon.className = 'fas fa-microphone-slash';
            awTeamsText.style.display = 'none';
            stopMicAnim();

            // Enable AI
            enableAI();
        }, 35000);
        timers.push(finishTimer);
    }

    // --- Enable AI chat ---
    function enableAI() {
        awChat.innerHTML = '';

        const intro = el('div', 'sim-chat-ai');
        intro.innerHTML = `
            <div class="sim-mem-badge"><i class="fas fa-brain"></i> Active Memory: Session 0/20</div>
            <strong><i class="fas fa-sparkles" style="color:var(--blue)"></i> HearJot AI Assistant:</strong><br>
            สวัสดีค่ะ! ถอดเสียงการประชุม <strong>"Q2 Budget Review"</strong> เสร็จสิ้นแล้ว มีทั้งหมด 3 ประเด็นสำคัญที่จดในโน้ตค่ะ<br><br>
            ลองคลิกคำถามด่วนด้านล่างหรือพิมพ์คุยได้เลยค่ะ:
            <div class="sim-quick-btns">
                <button class="sim-qbtn" data-q="สรุปประเด็นหลัก 3 ข้อ"><i class="fas fa-list-ul"></i> สรุปประเด็นหลักทั้งหมด</button>
                <button class="sim-qbtn" data-q="Action Items ที่ต้องทำมีอะไรบ้าง"><i class="fas fa-bullseye"></i> สรุป Action Items</button>
                <button class="sim-qbtn" data-q="ข้อมูลงบประมาณ Q2 เป็นอย่างไร"><i class="fas fa-chart-pie"></i> สรุปงบประมาณ Q2</button>
            </div>
        `;
        awChat.appendChild(intro);
        scrollBottom(awChat);

        // Bind quick buttons
        intro.querySelectorAll('.sim-qbtn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleChat(btn.dataset.q);
            });
        });

        awChatInput.disabled = false;
        awChatSend.disabled = false;
        awChatInput.focus();
    }

    // --- Handle chat ---
    function handleChat(text) {
        if (!text?.trim()) return;

        awChatInput.disabled = true;
        awChatSend.disabled = true;

        // User msg
        const userMsg = el('div', 'sim-chat-user', text);
        awChat.appendChild(userMsg);
        awChatInput.value = '';
        scrollBottom(awChat);

        // Typing dots
        const dots = el('div', 'sim-typing-dots', '<span class="d"></span><span class="d"></span><span class="d"></span>');
        awChat.appendChild(dots);
        scrollBottom(awChat);

        setTimeout(() => {
            dots.remove();
            chatMemory++;

            let resp = '';
            const q = text.toLowerCase();

            if (q.includes('ประเด็นหลัก') || q.includes('สรุป') && q.includes('ทั้งหมด')) {
                resp = `
                    <div class="sim-mem-badge"><i class="fas fa-brain"></i> Active Memory: Session ${chatMemory}/20</div>
                    <strong>HearJot AI Assistant:</strong><br>
                    สรุปประเด็นหลักการประชุม Q2 Budget Review ค่ะ:<br><br>
                    1️⃣ <strong>งบ Q2 ใช้ไป 82%</strong> จากงบที่วางแผนทั้งหมด<br>
                    2️⃣ <strong>แนะนำย้าย 18% ที่เหลือ → Q3</strong> เพื่อรองรับโปรเจกต์ AI Automation<br>
                    3️⃣ <strong>Action Item:</strong> คุณอัญชลีส่ง Budget Report ให้ Director ภายในวันศุกร์นี้
                `;
            } else if (q.includes('action') || q.includes('งานที่ต้อง')) {
                resp = `
                    <div class="sim-mem-badge"><i class="fas fa-brain"></i> Active Memory: Session ${chatMemory}/20</div>
                    <strong>HearJot AI Assistant:</strong><br>
                    รายการ Action Items จากการประชุมค่ะ:<br><br>
                    👤 <strong>ผู้รับผิดชอบ:</strong> คุณอัญชลี (Finance Lead)<br>
                    📋 <strong>งาน:</strong> จัดทำ Budget Report สรุปการใช้งบ Q2 พร้อม Forecast Q3<br>
                    📅 <strong>กำหนดส่ง:</strong> วันศุกร์นี้<br>
                    📤 <strong>ส่งให้:</strong> ทีม Director เพื่อตรวจสอบและอนุมัติ
                `;
            } else if (q.includes('งบ') || q.includes('budget') || q.includes('q2')) {
                resp = `
                    <div class="sim-mem-badge"><i class="fas fa-brain"></i> Active Memory: Session ${chatMemory}/20</div>
                    <strong>HearJot AI Assistant:</strong><br>
                    สรุปข้อมูลงบประมาณ Q2 ค่ะ:<br><br>
                    📊 <strong>ใช้งบไปแล้ว:</strong> 82% ของงบ Q2 ที่วางแผน<br>
                    💰 <strong>งบคงเหลือ:</strong> 18% ที่ยังไม่ได้ใช้<br>
                    📌 <strong>แผนถัดไป:</strong> ย้ายงบที่เหลือไป Q3 รองรับ AI Automation Project<br>
                    ⚠️ Report ต้องส่งภายในวันศุกร์นี้เพื่อนำเสนอ Director
                `;
            } else {
                resp = `
                    <div class="sim-mem-badge"><i class="fas fa-brain"></i> Active Memory: Session ${chatMemory}/20</div>
                    <strong>HearJot AI Assistant:</strong><br>
                    ขอบคุณค่ะ! จากการประชุมนี้มีประเด็น Action Item หลักคือคุณอัญชลีต้องส่ง Budget Report Q2 ภายในวันศุกร์นี้ค่ะ<br><br>
                    ต้องการให้ช่วยสรุปส่วนไหนเพิ่มเติมอีกไหมคะ?
                `;
            }

            const aiMsg = el('div', 'sim-chat-ai');
            aiMsg.innerHTML = resp;
            awChat.appendChild(aiMsg);
            scrollBottom(awChat);

            awChatInput.disabled = false;
            awChatSend.disabled = false;
            awChatInput.focus();
        }, 1200);
    }

    // --- Reset ---
    function resetSim() {
        // Kill timers
        timers.forEach(clearTimeout);
        timers = [];
        if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
        stopMicAnim();

        simRunning = false;
        chatMemory = 0;
        autoScrollPaused = false;
        awScrollToggle.classList.remove('paused');

        // Header reset
        awPlaceholder.style.display = '';
        awFileBadge.style.display = 'none';
        awMicChip.className = 'aw-mic-chip muted';
        awMicIcon.className = 'fas fa-microphone-slash';
        awTeamsText.style.display = 'none';
        awBars.forEach(b => b.style.height = '');

        // Restore panel 3 if collapsed
        if (panelCollapsed) {
            awPanel3.style.display = 'flex';
            awPanels.style.gridTemplateColumns = 'repeat(3, 1fr)';
            awCollapsePanel.innerHTML = '<i class="fas fa-chevron-right"></i>';
            panelCollapsed = false;
        }

        // Reset panel bodies
        awTranscript.innerHTML = `
            <div class="aw-empty" id="awTranscriptEmpty">
                <i class="fas fa-wave-square"></i>
                <p>กดปุ่ม "เริ่มประชุม" เพื่อดูการถอดความเรียลไทม์</p>
            </div>
        `;
        awNotebook.innerHTML = `
            <div class="aw-empty" id="awNotebookEmpty">
                <i class="fas fa-file-signature"></i>
                <p>พื้นที่จดโน้ตระหว่างประชุม: ใช้อ้างอิงแก้ transcript และเติมรายละเอียดเพิ่มเติม</p>
            </div>
        `;
        awChat.innerHTML = `
            <div class="aw-chat-welcome">
                <div class="aw-welcome-icon"><i class="fas fa-sparkles"></i></div>
                <h4>AI Co-Pilot พร้อมแล้ว</h4>
                <p>เริ่มประชุมก่อน แล้วถาม AI ได้เลยค่ะ</p>
            </div>
        `;
        awChatInput.disabled = true;
        awChatInput.value = '';
        awChatSend.disabled = true;

        awStartBtn.disabled = false;
        awResetBtn.disabled = true;
        awStatus.textContent = 'สถานะ: หยุดทำงาน';
    }

    // --- Wire up controls ---
    awStartBtn.addEventListener('click', startSim);
    awResetBtn.addEventListener('click', resetSim);

    awChatSend.addEventListener('click', () => {
        handleChat(awChatInput.value);
    });

    awChatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleChat(awChatInput.value);
    });


    // ============================================================
    // 5. PANEL CARD HOVER — Stagger entrance on scroll
    // ============================================================
    const panelCards = document.querySelectorAll('.panel-card, .feat-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Find sibling index for stagger
                const parent = entry.target.parentElement;
                const siblings = [...parent.children].filter(c =>
                    c.classList.contains('panel-card') || c.classList.contains('feat-card')
                );
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, idx * 100);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    panelCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        cardObserver.observe(card);
    });


    // ============================================================
    // 6. WORKSPACE DIAGRAM — Tab animation loop
    // ============================================================
    const wfSegs = document.querySelectorAll('.wf-seg');
    let segIdx = 0;

    setInterval(() => {
        wfSegs.forEach(s => s.style.opacity = '0.4');
        if (wfSegs[segIdx]) {
            wfSegs[segIdx].style.opacity = '1';
            wfSegs[segIdx].style.background = 'var(--blue-light)';
        }
        setTimeout(() => {
            wfSegs.forEach(s => {
                s.style.opacity = '1';
                s.style.background = '';
            });
        }, 600);
        segIdx = (segIdx + 1) % wfSegs.length;
    }, 2200);


    // ============================================================
    // 7. HAMBURGER MENU (Mobile)
    // ============================================================
    const navMenu      = document.getElementById('navMenu');
    const navHamburger = document.getElementById('navHamburger');

    if (navHamburger && navMenu) {
        navHamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('mobile-open');
            navHamburger.classList.toggle('open', isOpen);
            navHamburger.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', (e) => {
            if (!navHamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('mobile-open');
                navHamburger.classList.remove('open');
            }
        });

        function updateHamburger() {
            navHamburger.style.display = window.innerWidth <= 900 ? 'flex' : 'none';
            if (window.innerWidth > 900) {
                navMenu.classList.remove('mobile-open');
                navHamburger.classList.remove('open');
            }
        }

        window.addEventListener('resize', updateHamburger);
        updateHamburger();
    }


    // ============================================================
    // 8. SMOOTH SCROLL for nav links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
                if (navMenu) navMenu.classList.remove('mobile-open');
                if (navHamburger) navHamburger.classList.remove('open');
            }
        });
    });

    // ============================================================
    // 9. DYNAMIC SCROLL PROGRESS BAR
    // ============================================================
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const scrollPct = (window.scrollY / docHeight) * 100;
                scrollProgress.style.width = `${scrollPct}%`;
            }
        }, { passive: true });
    }

    // ============================================================
    // 10. 3D PERSPECTIVE MOUSE TILT PARALLAX on Hero Visual
    // ============================================================
    const heroVisual = document.querySelector('.hero-visual');
    const heroImgWrap = document.querySelector('.hero-img-wrap');
    if (heroVisual && heroImgWrap) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            // Calculate mouse coordinates relative to the center of the block (-1 to 1)
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // Limit tilt angles (max 12deg)
            const tiltX = -y * 12; 
            const tiltY = x * 12;
            
            heroImgWrap.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            
            // Subtle offset adjustment for floating cards in 3D space
            const floatCards = heroVisual.querySelectorAll('.float-card');
            floatCards.forEach((card, i) => {
                const speed = (i + 1) * 12;
                card.style.transform = `translate3d(${-x * speed}px, ${-y * speed}px, 60px)`;
            });
        });
        
        heroVisual.addEventListener('mouseleave', () => {
            heroImgWrap.style.transform = 'rotateX(0deg) rotateY(0deg)';
            const floatCards = heroVisual.querySelectorAll('.float-card');
            floatCards.forEach((card) => {
                card.style.transform = 'translate3d(0, 0, 45px)';
            });
        });
    }

    // ============================================================
    // 11. BATCH PROGRESS BAR TRIGGER ON VIEW
    // ============================================================
    const miniDemo = document.querySelector('.feat-mini-demo');
    if (miniDemo) {
        const demoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fill-active');
                    demoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        demoObserver.observe(miniDemo);
    }

    // ============================================================
    // 12. HERO DATA STREAM: AUDIO, TEXT, IMAGE, NOTE
    // ============================================================
    const container = document.getElementById('heroParticles');
    if (container) {
        const streamTypes = [
            { className: 'stream-icon blue', html: '<i class="fas fa-microphone"></i>' },
            { className: 'stream-icon green', html: '<i class="fas fa-wave-square"></i>' },
            { className: 'stream-icon purple', html: '<i class="fas fa-book-open"></i>' },
            { className: 'stream-icon sky', html: '<i class="fas fa-image"></i>' },
            { className: 'stream-icon blue', html: '<i class="fas fa-robot"></i>' },
            { className: 'stream-icon green', html: '<i class="fas fa-list-check"></i>' }
        ];

        let streamIndex = 0;

        function createAudioParticle() {
            if (document.hidden) return;
            const w = container.clientWidth || 500;
            const h = container.clientHeight || 500;
            const endX = w * (0.43 + (Math.random() - 0.5) * 0.08);
            const endY = h * (0.72 + (Math.random() - 0.5) * 0.06);
            
            let startX, startY;
            const edge = streamIndex % 4;
            if (edge === 0) {
                startX = -120;
                startY = h * (0.18 + Math.random() * 0.48);
            } else if (edge === 1) {
                startX = w + 90;
                startY = h * (0.16 + Math.random() * 0.45);
            } else if (edge === 2) {
                startX = w * (0.08 + Math.random() * 0.84);
                startY = -80;
            } else {
                startX = w * (0.05 + Math.random() * 0.52);
                startY = h + 70;
            }

            const el = document.createElement('div');
            const type = streamTypes[streamIndex % streamTypes.length];
            streamIndex += 1;
            el.className = `audio-particle flow-card ${type.className} flying`;
            el.innerHTML = type.html;
            
            el.style.setProperty('--startX', `${startX}px`);
            el.style.setProperty('--startY', `${startY}px`);
            el.style.setProperty('--midX', `${(startX + endX) / 2 + (Math.random() - 0.5) * w * 0.22}px`);
            el.style.setProperty('--midY', `${(startY + endY) / 2 - h * (0.08 + Math.random() * 0.12)}px`);
            el.style.setProperty('--endX', `${endX}px`);
            el.style.setProperty('--endY', `${endY}px`);
            el.style.setProperty('--startRot', `${-8 + Math.random() * 16}deg`);
            el.style.setProperty('--midRot', `${-5 + Math.random() * 10}deg`);
            el.style.setProperty('--endRot', `${-14 + Math.random() * 28}deg`);
            
            const duration = 7.2 + Math.random() * 3.2;
            el.style.setProperty('--duration', `${duration}s`);
            
            container.appendChild(el);
            setTimeout(() => {
                el.remove();
            }, duration * 1000);
        }
        
        setInterval(createAudioParticle, 1650);
        for (let i = 0; i < 4; i++) {
            setTimeout(createAudioParticle, i * 720);
        }
    }

    // ============================================================
    // 13. DOWNLOAD TRACKING (No backend): prompt name + local log
    // ============================================================
    const macUrlPart = 'IQBsIDFECaj7SqlS2QqbGKqaAYcRcl02a8NBImE1QCivSb8';
    const winUrlPart = 'IQDfhtNh5DTmTazQTfmgp4m2AdzU2iyCAu1CatCaR_Kp2BQ';
    const downloadLogEndpoint = (window.HEARJOT_CONFIG && window.HEARJOT_CONFIG.downloadLogEndpoint)
        ? window.HEARJOT_CONFIG.downloadLogEndpoint
        : '';
    const downloadLinks = document.querySelectorAll(`a[href*="${macUrlPart}"], a[href*="${winUrlPart}"]`);

    function saveDownloadLog(item) {
        const key = 'hearjot_download_logs';
        let logs = [];
        try {
            logs = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(logs)) logs = [];
        } catch {
            logs = [];
        }
        logs.push(item);
        localStorage.setItem(key, JSON.stringify(logs));
    }

    async function postDownloadLog(item) {
        if (!downloadLogEndpoint || downloadLogEndpoint.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) return;
        try {
            await fetch(downloadLogEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(item),
                keepalive: true
            });
        } catch (err) {
            console.warn('postDownloadLog failed:', err);
        }
    }

    downloadLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const name = window.prompt('ก่อนดาวน์โหลด กรุณาพิมพ์ชื่อผู้ดาวน์โหลด (จำเป็น)');
            if (!name || !name.trim()) return;

            const platform = link.href.includes(macUrlPart) ? 'mac' : 'windows';
            const logItem = {
                name: name.trim(),
                platform,
                url: link.href,
                time: new Date().toISOString(),
                userAgent: navigator.userAgent || '',
                page: window.location.href
            };
            saveDownloadLog(logItem);
            window.open(link.href, '_blank', 'noopener,noreferrer');
            postDownloadLog(logItem);
        });
    }

});
