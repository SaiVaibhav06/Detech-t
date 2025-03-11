document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("loggedInUsername");
    const authLinks = document.getElementById("auth-links");
    const userInfo = document.getElementById("user-info");
    const logoutButton = document.getElementById("logout-button");
    const taskList = document.getElementById("task-list");
    const startRecordingButton = document.getElementById("start-recording");
    const statusText = document.getElementById("status");

    // ✅ Show/hide login/signup and logout button based on login status
    if (username) {
        authLinks.style.display = "none";
        userInfo.style.display = "flex";
        loadTasks(); // Load user-specific tasks
    } else {
        userInfo.style.display = "none";
    }

    // ✅ Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("loggedInUsername");
            window.location.href = "login.html"; // Redirect to login
        });
    }

    // ✅ Redirect functions
    window.redirectToSignup = () => window.location.href = "signup.html";
    window.redirectToLogin = () => window.location.href = "login.html";

    // ✅ Convert AM/PM to 24-hour format
    function convertTo24Hour(time, ampm) {
        let [hours, minutes] = time.split(":").map(Number);
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // ✅ Function to Add Task with Proper Spacing
    function addTaskToList(taskText, taskDate, taskTime24, taskAMPM) {
        const taskItem = document.createElement("li");

        // Add elements for date, time, and AM/PM separately to style them properly
        taskItem.innerHTML = `
            ${taskText} - 
            <span class="task-date">📅 <b>${taskDate}</b></span>
            <span class="task-time">🕒 <b>${taskTime24}</b></span>
            <span class="task-ampm"><b>${taskAMPM}</b></span>
        `;

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", () => {
            taskItem.remove();
            removeTask(taskText, taskDate, taskTime24, taskAMPM);
        });

        taskItem.appendChild(deleteButton);
        taskList.appendChild(taskItem);

        // ✅ Schedule Reminder 1 Hour Before
        scheduleReminder(taskText, taskDate, taskTime24);
    }

    // ✅ Function to Schedule Reminder 1 Hour Before Task Time
    function scheduleReminder(taskText, taskDate, taskTime24) {
        const taskDateTime = new Date(`${taskDate}T${taskTime24}`);
        const now = new Date();

        // Calculate reminder time (1 hour before)
        const reminderTime = new Date(taskDateTime.getTime() - 60 * 60 * 1000);

        if (reminderTime > now) {
            const timeUntilReminder = reminderTime - now;

            setTimeout(() => {
                alert(`⏰ Reminder: Your task "${taskText}" is in 1 hour!`);
            }, timeUntilReminder);
        }
    }

    // ✅ Function to Save Task in localStorage
    function saveTask(taskText, taskDate, taskTime24, taskAMPM) {
        if (!username) return;

        let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
        const taskEntry = { text: taskText, date: taskDate, time: taskTime24, ampm: taskAMPM };

        tasks.push(taskEntry);
        localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
    }

    // ✅ Function to Load Tasks from localStorage
    function loadTasks() {
        if (!username) return;

        let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
        tasks.forEach(task => addTaskToList(task.text, task.date, task.time, task.ampm));
    }

    // ✅ Function to Remove Task from localStorage
    function removeTask(taskText, taskDate, taskTime24, taskAMPM) {
        if (!username) return;

        let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
        tasks = tasks.filter(task => !(task.text === taskText && task.date === taskDate && task.time === taskTime24 && task.ampm === taskAMPM));
        localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
    }

    // ✅ Manual Task Addition with AM/PM
    window.addTaskManually = () => {
        const taskInput = document.getElementById("task-input").value.trim();
        const taskDate = document.getElementById("task-date").value;
        const taskTime = document.getElementById("task-time").value;
        const taskAMPM = document.getElementById("task-ampm").value;

        if (!taskInput || !taskDate || !taskTime) {
            alert("Please enter task, date, and time!");
            return;
        }

        const taskTime24 = convertTo24Hour(taskTime, taskAMPM);

        addTaskToList(taskInput, taskDate, taskTime24, taskAMPM);
        saveTask(taskInput, taskDate, taskTime24, taskAMPM);

        document.getElementById("task-input").value = "";
        document.getElementById("task-date").value = "";
        document.getElementById("task-time").value = "";
    };

    // ✅ Voice Recognition Setup
    if (startRecordingButton && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.lang = "en-US";

        startRecordingButton.addEventListener("click", () => {
            statusText.textContent = "Listening...";
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                statusText.textContent = "Recognized: " + transcript;

                const taskDate = prompt("Enter task date (YYYY-MM-DD):");
                const taskTime = prompt("Enter task time (HH:MM):");
                const taskAMPM = prompt("Enter AM or PM:");

                if (!taskDate || !taskTime || !taskAMPM) {
                    alert("You must enter date, time, and AM/PM.");
                    return;
                }

                const taskTime24 = convertTo24Hour(taskTime, taskAMPM);
                addTaskToList(transcript, taskDate, taskTime24, taskAMPM);
                saveTask(transcript, taskDate, taskTime24, taskAMPM);
            } else {
                statusText.textContent = "No speech detected. Try again!";
            }
        };

        recognition.onerror = (event) => {
            statusText.textContent = "Error: " + event.error;
        };
    } else {
        if (statusText) statusText.textContent = "Speech recognition is not supported.";
        if (startRecordingButton) startRecordingButton.disabled = true;
    }
});

// ✅ CSS for Proper Spacing (Add this to your CSS file)
const style = document.createElement('style');
style.innerHTML = `
    .task-date, .task-time, .task-ampm {
        margin-left: 15px;
        font-size: 16px;
    }
    .delete-button {
        margin-left: 15px;
        cursor: pointer;
        background: none;
        border: none;
        font-size: 16px;
    }
`;
document.head.appendChild(style);
