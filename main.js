const Days = document.getElementById('days');
const Hours = document.getElementById('hours');
const Minutes = document.getElementById('minutes');
const Seconds = document.getElementById('seconds');

const targetDate = new Date("November 17 2025 00:00:00").getTime();

function timer () {
    const currentDate = new Date().getTime();
    const distance = targetDate - currentDate;

    const days = Math.floor(distance / 1000 / 60 / 60 / 24);
    const hours = Math.floor(distance / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(distance / 1000 / 60) % 60;
    const seconds = Math.floor(distance / 1000) % 60;

    Days.innerHTML = days;
    Hours.innerHTML = hours;
    Minutes.innerHTML = minutes;
    Seconds.innerHTML = seconds;

    if(distance < 0){
        Days.innerHTML = "00";
        Hours.innerHTML = "00";
        Minutes.innerHTML = "00";
        Seconds.innerHTML = "00";
    }
}

setInterval(timer, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const pollForm = document.getElementById('poll-form');

    // Function to load and display poll results
    const loadPollResults = (pollName) => {
        const pollData = JSON.parse(localStorage.getItem(`poll-${pollName}`)) || {};
        const totalVotes = Object.values(pollData).reduce((sum, count) => sum + count, 0);

        const pollQuestionDiv = document.querySelector(`.poll-question[data-poll-name="${pollName}"]`);
        if (!pollQuestionDiv) return; // Exit if poll div not found (e.g., on index.html)

        pollQuestionDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
            const optionValue = radio.value;
            const voteCount = pollData[optionValue] || 0;
            const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;

            const bar = document.getElementById(`${pollName}-${optionValue}-bar`);
            // Check if bar exists before trying to access nextElementSibling
            const percentageSpan = bar ? bar.nextElementSibling.querySelector('.poll-percentage') : null;
            const countSpan = bar ? bar.nextElementSibling.querySelector('.poll-count') : null;

            if (bar) {
                bar.style.width = `${percentage}%`;
            }
            if (percentageSpan) {
                percentageSpan.textContent = `${percentage.toFixed(1)}%`;
            }
            if (countSpan) {
                countSpan.textContent = `${voteCount}`;
            }
        });

        // Hide voting options and show bars if already voted
        if (localStorage.getItem(`voted-${pollName}`)) {
            pollQuestionDiv.classList.add('voted');
        }
    };

    // Load results for all polls on page load if on polls.html
    if (pollForm) { // Only run poll logic if pollForm exists (i.e., we are on polls.html)
        document.querySelectorAll('.poll-question').forEach(pollDiv => {
            const pollName = pollDiv.dataset.pollName;
            loadPollResults(pollName);
        });

        // Event listener for form submission (voting)
        pollForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const clickedButton = event.submitter; // Get the button that was clicked
            if (!clickedButton || !clickedButton.classList.contains('polls-button')) {
                return; // Only proceed if a poll button was clicked
            }

            const pollName = clickedButton.dataset.poll; // Get the poll name from the button's data-poll attribute
            if (!pollName) {
                console.error('Poll name not found for the submitted button.');
                return;
            }

            const selectedOption = pollForm.querySelector(`input[name="${pollName}"]:checked`);

            if (selectedOption) {
                const optionValue = selectedOption.value;

                // Get existing poll data or initialize
                const pollData = JSON.parse(localStorage.getItem(`poll-${pollName}`)) || {};

                // Increment vote for the selected option
                pollData[optionValue] = (pollData[optionValue] || 0) + 1;

                // Save updated poll data to localStorage
                localStorage.setItem(`poll-${pollName}`, JSON.stringify(pollData));
                localStorage.setItem(`voted-${pollName}`, 'true'); // Mark this poll as voted by the user

                // Update display for the specific poll
                loadPollResults(pollName);

                // Hide voting options and show bars
                const pollQuestionDiv = document.querySelector(`.poll-question[data-poll-name="${pollName}"]`);
                if (pollQuestionDiv) {
                    pollQuestionDiv.classList.add('voted');
                }

            } else {
                alert('Please select an option before placing your bet!');
            }
        });
    }
});
  
  