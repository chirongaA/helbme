// assets/js/result.js
document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const menu = document.getElementById("menu");

  menuIcon.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== menuIcon) {
      menu.classList.add("hidden");
    }
  });
});