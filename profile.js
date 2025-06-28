window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.email) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  // Load current user data
  try {
    const res = await fetch(`http://localhost:5000/api/user?email=${user.email}`);
    const data = await res.json();

    if (res.ok) {
      document.getElementById("name").value = data.name || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("city").value = data.city || "";
      document.getElementById("phone").value = data.phone || "";
    } else {
      alert(data.error || "Failed to load profile");
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    alert("Error fetching profile data.");
  }

  // Handle profile update
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedUser = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value, // still needed to identify user
      city: document.getElementById("city").value,
      phone: document.getElementById("phone").value,
    };

    try {
      const res = await fetch("http://localhost:5000/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Update error.");
    }
  });

  // Handle logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
});