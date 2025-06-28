document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Login successful!");
      console.log("Logged-in user:", result.user);
      // Optionally save user data to localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      console.log("Redirecting to match,html.....;")
      // Redirect to dashboard if needed
      window.location.href = "match.html";
    } else {
      alert(result.msg || "Invalid credentials");
    }
  } catch (error) {
    alert("Login error: " + error.message);
  }
});