const sidePanel = document.getElementById('sidePanel');
const toggleSide = document.getElementById('toggleSide');
const toggleIcon = document.getElementById('toggleIcon');

const ICON_OPEN   = '../../assets/images/Group 17.png';     // вліво — панель розгорнута
const ICON_CLOSED = '../../assets/images/Group 17 (1).png'; // вправо — панель згорнута

if (toggleSide && sidePanel) {
    toggleSide.addEventListener('click', () => {
        sidePanel.classList.toggle('collapsed');
        const isCollapsed = sidePanel.classList.contains('collapsed');
        if (toggleIcon) {
            toggleIcon.src = isCollapsed ? ICON_CLOSED : ICON_OPEN;
        }
    });
}
