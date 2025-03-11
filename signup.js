document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store username in localStorage
            localStorage.setItem("loggedInUsername", username);

            alert("Signup successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert("Error: " + (data.error || "Something went wrong."));
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Failed to connect to server. Please try again.");
    }
});
