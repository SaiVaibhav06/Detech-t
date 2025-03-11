document.addEventListener("DOMContentLoaded", () => {
    const recordButton = document.getElementById("start-recording");
    const taskList = document.getElementById("task-list");

    let recognition;

    if ("webkitSpeechRecognition" in window) {
        recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function () {
            document.getElementById("status").innerText = "Listening...";
        };

        recognition.onerror = function (event) {
            document.getElementById("status").innerText = "Error: " + event.error;
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById("status").innerText = "Recognized: " + transcript;

            console.log("Sending to server:", transcript);

            // Send task to server
            fetch("/add-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: transcript }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Server response:", data);
                    if (data.task) {
                        addTaskToUI(data.task);
                    } else {
                        console.error("Error adding task:", data);
                    }
                })
                .catch(error => console.error("Fetch error:", error));
        };
    } else {
        alert("Your browser does not support speech recognition.");
    }

    recordButton.addEventListener("click", () => {
        recognition.start();
    });

    // Function to add task to UI with remove feature
    function addTaskToUI(taskText) {
        const li = document.createElement("li");
        li.textContent = taskText;

        // Add a click event to remove the task
        li.addEventListener("click", function () {
            fetch("/remove-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: taskText }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        li.remove(); // Remove from UI
                    } else {
                        console.error("Error removing task:", data);
                    }
                })
                .catch(error => console.error("Fetch error:", error));
        });

        taskList.appendChild(li);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const recordButton = document.getElementById("start-recording");

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        taskList.innerHTML = "";  // Clear previous tasks
        tasks.forEach(task => {
            addTaskToUI(task);
        });
    }

    function saveTask(task) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        addTaskToUI(task);
    }

    function addTaskToUI(task) {
        const li = document.createElement("li");
        li.textContent = task;
        li.addEventListener("click", () => removeTask(task, li));  // Click to remove
        taskList.appendChild(li);
    }

    function removeTask(task, element) {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks = tasks.filter(t => t !== task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        element.remove();
    }

    recordButton.addEventListener("click", () => {
        // Simulating voice recognition
        const newTask = prompt("Say your task"); // Replace this with Speech API
        if (newTask) saveTask(newTask);
    });

    loadTasks();  // Load tasks on page load
});
