(() => {
  const key = "ouachita-dark-mode";
  const root = document.documentElement;
  let preference = "system";

  function apply(value) {
    preference = value === "on" || value === "off" ? value : "system";
    root.dataset.darkMode = preference;
    const select = document.getElementById("dark-mode");
    if (select) select.value = preference;
  }

  try {
    apply(localStorage.getItem(key));
  } catch {
    // System colors still work when storage is unavailable.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("dark-mode");
    select.value = preference;
    select.parentElement.hidden = false;
    select.addEventListener("change", () => {
      apply(select.value);
      try {
        localStorage.setItem(key, preference);
      } catch {
        // The selected mode still applies to this page.
      }
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
