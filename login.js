document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Store username properly
                localStorage.setItem("loggedInUsername", data.username); // Ensure we store the correct username
                localStorage.setItem("token", data.token);

                alert("Login successful! Redirecting...");
                window.location.href = "index.html";  
            } else {
                alert("Error: " + (data.error || "Invalid credentials."));
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Failed to connect to server. Please try again.");
        }
    });
});
