const checklist = document.querySelectorAll(".checklist input");
const goalButton = document.querySelector(".stat .ghost");
const goalText = document.querySelector(".stat p");

function updateProgress() {
  const completed = Array.from(checklist).filter((item) => item.checked)
    .length;
  goalText.textContent = `${completed} steps complete today`;
}

checklist.forEach((item) => item.addEventListener("change", updateProgress));

goalButton.addEventListener("click", () => {
  goalButton.textContent = "Goal updated ✔";
});

updateProgress();
