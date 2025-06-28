window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect if not logged in
  if (!user || !user.email) {
    alert("You must log in first.");
    window.location.href = "login.html";
    return;
  }

  const matchBox = document.createElement("div");
  matchBox.className = "mt-6 space-y-4 w-full max-w-xl mx-auto";

  try {
    // Fetch matches from backend using user's city
    const res = await fetch(`http://localhost:5000/api/match?city=${user.city}`);
    const matches = await res.json();

    if (res.ok && matches.length > 0) {
      const filtered = matches.filter(match => match.email !== user.email);
      
      if (filtered.length === 0) {
        matchBox.innerHTML = `<p class="text-center text-gray-600">No other users found in your city yet.</p>`;
      } else {
        filtered.forEach(match => {
          const card = document.createElement("div");
          card.className = "bg-white shadow-lg rounded-xl p-5 transition hover:scale-105";

          card.innerHTML = `
            <h3 class="text-xl font-semibold text-purple-700">${match.name}</h3>
            <p class="text-sm text-gray-600 mb-1">${match.email}</p>
            <p class="text-sm text-gray-500">City: ${match.city}</p>
          `;
          card.innerHTML = `
            <h3 class="text-xl font-semibold text-purple-700">${match.name}</h3>
            <p class="text-sm text-gray-600 mb-1">${match.email}</p>
            <p class="text-sm text-gray-500 mb-1">City: ${match.city}</p>
            <p class="text-sm text-gray-500">Phone: ${match.phone || "N/A"}</p>
`;
          matchBox.appendChild(card);
        });
      }
    } else {
      matchBox.innerHTML = `<p class="text-center text-gray-600">No matches found in your city yet.</p>`;
    }
  } catch (error) {
    console.error("Error fetching matches:", error);
    matchBox.innerHTML = `<p class="text-center text-red-500">Unable to load matches. Please try again later.</p>`;
  }

  // Append results below your existing content
  document.body.appendChild(matchBox);
  
});