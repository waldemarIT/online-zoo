// �� Side panel toggle ��
const sidePanel = document.getElementById('sidePanel');
const toggleSide = document.getElementById('toggleSide');
const toggleIcon = document.getElementById('toggleIcon');

const ICON_OPEN   = '../../assets/images/Group 17.png';
const ICON_CLOSED = '../../assets/images/Group 17 (1).png';

if (toggleSide && sidePanel) {
    toggleSide.addEventListener('click', () => {
        sidePanel.classList.toggle('collapsed');
        const isCollapsed = sidePanel.classList.contains('collapsed');
        if (toggleIcon) {
            toggleIcon.src = isCollapsed ? ICON_CLOSED : ICON_OPEN;
        }
    });
}

// �� Donate modal (3-step) ��
const donateBtn   = document.getElementById('donateBtn');
const donateModal = document.getElementById('donateModal');
const modalClose  = document.getElementById('modalClose');

function showStep(n) {
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('step-' + n);
    if (target) target.classList.add('active');
}

if (donateBtn && donateModal) {
    donateBtn.addEventListener('click', () => {
        showStep(0);
        const hdr = document.getElementById('modalHeaderBar');
        if (hdr) hdr.style.display = 'none';
        donateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    modalClose.addEventListener('click', () => {
        donateModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    donateModal.addEventListener('click', (e) => {
        if (e.target === donateModal) {
            donateModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (e.target.classList.contains('hero-amount')) {
            const hdr = document.getElementById('modalHeaderBar');
            if (hdr) hdr.style.display = 'block';
            showStep(1);
        }

        if (e.target.classList.contains('btn-next-step')) {
            showStep(e.target.dataset.next);
        }
        if (e.target.classList.contains('btn-back-step')) {
            showStep(e.target.dataset.back);
        }
        if (e.target.classList.contains('btn-complete')) {
            donateModal.classList.remove('active');
            document.body.style.overflow = '';
            alert('Thank you for your donation!');
        }
        if (e.target.classList.contains('amount-btn')) {
            donateModal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
}
// ── Click-to-play YouTube video ──
document.querySelectorAll('.main-cam[data-video]').forEach(cam => {
    const playBtn = cam.querySelector('.play-btn');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
        const videoId = cam.dataset.video;
        const label = cam.querySelector('.cam-label');
        const labelText = label ? label.textContent : '';

        cam.innerHTML =
            `<iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
                title="${labelText}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>`;
    });
});