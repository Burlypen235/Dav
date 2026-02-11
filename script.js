const notesData = [
  {
    subject: "Mathematics",
    chapter: "Real Numbers",
    points: ["Euclid division lemma", "HCF and LCM", "Irrational numbers"]
  },
  {
    subject: "Science",
    chapter: "Light - Reflection and Refraction",
    points: ["Mirror formula", "Lens formula", "Ray diagrams"]
  },
  {
    subject: "English",
    chapter: "First Flight: Prose & Poems",
    points: ["Theme summaries", "Important lines", "Short answer practice"]
  },
  {
    subject: "Social Science",
    chapter: "Nationalism in India",
    points: ["Movement timeline", "Key leaders", "Map-based questions"]
  },
  {
    subject: "Hindi",
    chapter: "Kritika & Kshitij",
    points: ["Chapter explanations", "Word meanings", "Long-answer tips"]
  },
  {
    subject: "Information Technology",
    chapter: "Digital Documentation",
    points: ["Writer basics", "Styles and formatting", "Shortcut keys"]
  }
];

const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");

function renderNotes(filterText = "") {
  const keyword = filterText.trim().toLowerCase();

  const filtered = notesData.filter((item) => {
    const searchable = `${item.subject} ${item.chapter} ${item.points.join(" ")}`.toLowerCase();
    return searchable.includes(keyword);
  });

  notesGrid.innerHTML = "";

  if (!filtered.length) {
    notesGrid.innerHTML = "<p>No notes found. Try another keyword.</p>";
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "note-card";

    card.innerHTML = `
      <h3>${item.subject}</h3>
      <p><strong>Chapter:</strong> ${item.chapter}</p>
      <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
    `;

    notesGrid.appendChild(card);
  });
}

searchInput.addEventListener("input", (event) => {
  renderNotes(event.target.value);
});

renderNotes();
