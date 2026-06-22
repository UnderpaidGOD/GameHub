// wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // initialize all bootstrap tooltips (if used)
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  console.log("global script initialized.");
});
