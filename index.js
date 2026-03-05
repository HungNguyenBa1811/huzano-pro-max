// CUSTOM ROUTER 50% AI
let examTimer = null;

// Admin pages
let adminRoutes = {
    '/admin/exams': { tpl: 'tpl-admin-exams', nav: 'exams', title: 'Quản lý kỳ thi' },
    '/admin/users': { tpl: 'tpl-admin-users', nav: 'users', title: 'Quản lý sinh viên' },
    '/admin/exam/new': { tpl: 'tpl-admin-exam-edit', nav: 'exams', title: 'Tạo kỳ thi mới' },
    '/admin/exam/edit': { tpl: 'tpl-admin-exam-edit', nav: 'exams', title: 'Chỉnh sửa kỳ thi' },
    '/admin/stats': { tpl: 'tpl-admin-stats', nav: 'stats', title: 'Thống kê' },
    '/admin/student-results': {
        tpl: 'tpl-admin-student-results',
        nav: 'student-results',
        title: 'Kết quả sinh viên',
    },
};

// User pages
let pageMap = {
    '/login': 'tpl-login',
    '/register': 'tpl-register',
    '/home': 'tpl-home',
    '/exam': 'tpl-exam',
    '/result': 'tpl-result',
    '/admin/login': 'tpl-admin-login',
};

function renderTemplate(tplId, target) {
    let tpl = document.getElementById(tplId);
    target.innerHTML = '';
    target.appendChild(tpl.content.cloneNode(true));
}

function router() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
    let path = location.hash.slice(1) || '/login';
    let app = document.getElementById('app');

    if (adminRoutes[path]) {
        let cfg = adminRoutes[path];
        renderTemplate('tpl-admin-shell', app);
        document.getElementById('topbar-title').textContent = cfg.title;
        // Active sidebar
        document.querySelectorAll('.sidebar-nav li').forEach(function (li) {
            li.removeAttribute('data-active');
            if (li.dataset.nav === cfg.nav) li.setAttribute('data-active', '');
        });
        renderTemplate(cfg.tpl, document.getElementById('admin-content'));
        initAdminPage(path);
        return;
    }

    let tplId = pageMap[path];
    if (tplId) {
        renderTemplate(tplId, app);
        initPage(path);
    } else {
        location.hash = '#/login';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// PAGE INIT
function initPage(path) {
    if (path === '/login') {
        document.getElementById('form-login').addEventListener('submit', function (e) {
            e.preventDefault();
            location.hash = '#/home';
        });
    }
    if (path === '/register') {
        document.getElementById('form-register').addEventListener('submit', function (e) {
            e.preventDefault();
            location.hash = '#/home';
        });
    }
    if (path === '/admin/login') {
        document.getElementById('form-admin-login').addEventListener('submit', function (e) {
            e.preventDefault();
            location.hash = '#/admin/exams';
        });
    }
    if (path === '/exam') {
        initExam();
    }
}

// EXAM TIMER
function initExam() {
    let seconds = 30 * 60;
    const tick = () => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        const el = document.getElementById('exam-timer');
        if (el) el.textContent = `${m}:${s}`;
        if (seconds-- <= 0) {
            clearInterval(examTimer);
            examTimer = null;
            document.getElementById('dialog-timeout')?.showModal();
        }
    };
    tick();
    examTimer = setInterval(tick, 1000);

    let btnSubmit = document.getElementById('btn-submit-exam');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', function () {
            document.getElementById('dialog-confirm').showModal();
        });
    }
    let btnDoSubmit = document.getElementById('btn-do-submit');
    if (btnDoSubmit) {
        btnDoSubmit.addEventListener('click', function () {
            clearInterval(examTimer);
            examTimer = null;
            document.getElementById('dialog-confirm').close();
            location.hash = '#/result';
        });
    }
    let btnCancel = document.getElementById('btn-cancel-submit');
    if (btnCancel) {
        btnCancel.addEventListener('click', function () {
            document.getElementById('dialog-confirm').close();
        });
    }

    document.querySelectorAll('#exam-nav button[data-q]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            let target = document.getElementById(btn.dataset.q);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
    document.querySelectorAll('#exam-questions input[type=radio]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            let names = new Set();
            document.querySelectorAll('#exam-questions input[type=radio]:checked').forEach(function (r) {
                names.add(r.name);
            });
            let el = document.getElementById('exam-done');
            if (el) el.textContent = names.size;
        });
    });
}

// ADMIN PAGE INIT
function initAdminPage(path) {
    if (path === '/admin/stats') {
        initStatsChart();
        let btnExport = document.getElementById('btn-export-stats');
        if (btnExport)
            btnExport.addEventListener('click', function () {
                alert('Xuất báo cáo (demo)');
            });
    }
    if (path === '/admin/exam/new' || path === '/admin/exam/edit') {
        initExamEditPage();
    }
    if (path === '/admin/student-results') {
        initStudentResults();
    }
}

// EXAM EDIT PAGE
function initExamEditPage() {
    let accessEl = document.getElementById('fe-access');
    let scheduleEl = document.getElementById('fe-schedule');
    if (accessEl && scheduleEl) {
        accessEl.addEventListener('change', function () {
            scheduleEl.style.display = this.value === 'scheduled' ? '' : 'none';
        });
    }

    // Add question (stub)
    let btnAddQ = document.getElementById('btn-add-q');
    if (btnAddQ) {
        btnAddQ.addEventListener('click', function () {
            alert('Thêm câu hỏi mới (demo - tự implement)');
        });
    }

    // Submit form (stub)
    let form = document.getElementById('form-exam-edit');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Đã lưu kỳ thi! (demo)');
            location.hash = '#/admin/exams';
        });
    }
}

// STATS CHART (AI)
function initStatsChart() {
    let canvas = document.getElementById('chart-scores');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');

    let data = [0, 2, 5, 10, 18, 35, 55, 65, 30, 14];
    let labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'];
    let max = Math.max.apply(null, data);
    let W = canvas.width,
        H = canvas.height;
    let padL = 40,
        padB = 30,
        padT = 10,
        padR = 10;
    let chartW = W - padL - padR;
    let chartH = H - padB - padT;
    let barW = chartW / data.length;

    ctx.clearRect(0, 0, W, H);

    data.forEach(function (val, i) {
        let barH = max > 0 ? (val / max) * chartH : 0;
        let x = padL + i * barW + 4;
        let y = padT + chartH - barH;
        ctx.fillStyle = '#BC2626';
        ctx.fillRect(x, y, barW - 8, barH);
        ctx.fillStyle = '#333';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + (barW - 8) / 2, H - 8);
        if (val > 0) {
            ctx.fillText(val, x + (barW - 8) / 2, y - 3);
        }
    });

    // Y-axis label
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('SV', padL - 4, padT + 8);
}

// STUDENT RESULTS
function initStudentResults() {
    let dialog = document.getElementById('dialog-student-detail');
    if (!dialog) return;

    document.querySelectorAll('[id^="btn-detail-"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            dialog.showModal();
        });
    });

    let btnClose = document.getElementById('btn-close-detail');
    if (btnClose)
        btnClose.addEventListener('click', function () {
            dialog.close();
        });
    let btnPrint = document.getElementById('btn-print-detail');
    if (btnPrint)
        btnPrint.addEventListener('click', function () {
            window.print();
        });
}
