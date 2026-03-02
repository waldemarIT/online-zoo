const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const track = document.getElementById('sliderTrack');
const petsGrid = track ? track.querySelector('.pets-grid') : null;

function goNext() {
    if (!petsGrid || petsGrid.children.length < 2) {
        return;
    }
    const firstCard = petsGrid.firstElementChild;
    petsGrid.appendChild(firstCard);
}

function goPrev() {
    if (!petsGrid || petsGrid.children.length < 2) {
        return;
    }
    const lastCard = petsGrid.lastElementChild;
    petsGrid.insertBefore(lastCard, petsGrid.firstElementChild);
}

if (nextBtn) {
    nextBtn.addEventListener('click', goNext);
}

if (prevBtn) {
    prevBtn.addEventListener('click', goPrev);
}

const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');
const feedbackContainer = document.querySelector('.feedback-grid');

function nextFeedback() {
    if (!feedbackContainer || feedbackContainer.children.length < 2) return;
    feedbackContainer.style.opacity = '0.5';
    setTimeout(() => {
        const firstFeedback = feedbackContainer.firstElementChild;
        feedbackContainer.appendChild(firstFeedback);
        feedbackContainer.style.opacity = '1';
    }, 200);
}

function prevFeedback() {
    if (!feedbackContainer || feedbackContainer.children.length < 2) return;
    feedbackContainer.style.opacity = '0.5';
    setTimeout(() => {
        const lastFeedback = feedbackContainer.lastElementChild;
        feedbackContainer.insertBefore(lastFeedback, feedbackContainer.firstElementChild);
        feedbackContainer.style.opacity = '1';
    }, 200);
}

if (testimonialNext) testimonialNext.addEventListener('click', nextFeedback);
if (testimonialPrev) testimonialPrev.addEventListener('click', prevFeedback);

document.querySelectorAll('.pet-card').forEach(card => {
    card.addEventListener('click', () => {
        const link = card.querySelector('.live-link').getAttribute('href');
        if (link) window.location.href = link;
    });
});