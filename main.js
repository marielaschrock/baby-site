// --- Existing Countdown Timer Logic ---
const Days = document.getElementById('days');
const Hours = document.getElementById('hours');
const Minutes = document.getElementById('minutes');
const Seconds = document.getElementById('seconds');

// Set your target date for the countdown
const targetDate = new Date("November 17 2025 00:00:00").getTime();

function timer () {
    const currentDate = new Date().getTime();
    const distance = targetDate - currentDate;

    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the results in the elements
    if (Days) Days.innerHTML = days < 10 ? '0' + days : days;
    if (Hours) Hours.innerHTML = hours < 10 ? '0' + hours : hours;
    if (Minutes) Minutes.innerHTML = minutes < 10 ? '0' + minutes : minutes;
    if (Seconds) Seconds.innerHTML = seconds < 10 ? '0' + seconds : seconds;

    // If the countdown is finished
    if(distance < 0){
        // Ensure elements exist before setting innerHTML
        if (Days) Days.innerHTML = "00";
        if (Hours) Hours.innerHTML = "00";
        if (Minutes) Minutes.innerHTML = "00";
        if (Seconds) Seconds.innerHTML = "00";
        clearInterval(countdownInterval); // Stop the timer
    }
}

// Run the timer function every second
const countdownInterval = setInterval(timer, 1000);
timer(); // Call once immediately to avoid initial delay

// --- Poll Functionality Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const pollForm = document.getElementById('poll-form');
    const globalNameInput = document.getElementById('global-voter-name'); // Get the global name input

    // Function to load and display poll results AND voter records
    const loadPollResults = (pollName) => {
        // Initialize poll data structure: { counts: {option1: count, ...}, voterRecords: {name1: option1, ...} }
        let pollData = JSON.parse(localStorage.getItem(`poll-${pollName}`));
        if (!pollData || !pollData.counts || !pollData.voterRecords) {
            pollData = { counts: {}, voterRecords: {} };
        }

        const pollQuestionDiv = document.querySelector(`.poll-question[data-poll-name="${pollName}"]`);
        if (!pollQuestionDiv) return; // Exit if poll div not found (e.g., on index.html)

        const currentVoterName = globalNameInput ? globalNameInput.value.trim() : '';
        const submitButton = pollQuestionDiv.querySelector(`.polls-button[data-poll="${pollName}"]`);

        // Check if it's a text input poll (weight or datetime)
        // This check is now more precise: only if the poll name matches the expected input type
        const isTextInputPoll = (pollName === 'babyWeight' && pollQuestionDiv.querySelector('input[type="text"]')) ||
                                (pollName === 'deliveryDateTime' && pollQuestionDiv.querySelector('input[type="datetime-local"]'));


        if (isTextInputPoll) {
            const pollInput = pollQuestionDiv.querySelector('input[type="text"]') || pollQuestionDiv.querySelector('input[type="datetime-local"]'); // Get the specific input element
            if (!pollInput) return; // Should not happen if isTextInputPoll is true, but good safeguard

            if (currentVoterName && pollData.voterRecords[currentVoterName]) {
                // If already voted, disable input and button, show their bet
                pollInput.disabled = true;
                pollInput.value = pollData.voterRecords[currentVoterName];
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Bet Placed!';
                    submitButton.style.backgroundColor = '#333';
                    submitButton.style.borderColor = '#666';
                    submitButton.style.boxShadow = 'none';
                }
            } else {
                // If not voted, enable input and button, clear previous value
                pollInput.disabled = false;
                // Only clear if the input is not disabled by a previous vote, otherwise it would clear the displayed vote.
                if (!pollInput.disabled) {
                     pollInput.value = ''; // Clear value if re-enabled
                }
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Place Bet';
                    submitButton.style.backgroundColor = '#006400';
                    submitButton.style.borderColor = '#FFD700';
                    submitButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }
            }
        } else {
            // This is for radio button polls
            const totalVotes = Object.values(pollData.counts).reduce((sum, count) => sum + count, 0);

            // Update poll bars and percentages
            pollQuestionDiv.querySelectorAll('input[type="radio"]').forEach(radio => {
                const optionValue = radio.value;
                const voteCount = pollData.counts[optionValue] || 0;
                const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;

                const bar = document.getElementById(`${pollName}-${optionValue}-bar`);
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

            // Check if the current global name has already voted for THIS SPECIFIC RADIO POLL
            if (currentVoterName && pollData.voterRecords[currentVoterName]) {
                pollQuestionDiv.querySelectorAll(`input[name="${pollName}"]`).forEach(radio => radio.disabled = true);
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Bet Placed!';
                    submitButton.style.backgroundColor = '#333';
                    submitButton.style.borderColor = '#666';
                    submitButton.style.boxShadow = 'none';
                }
            } else {
                pollQuestionDiv.querySelectorAll(`input[name="${pollName}"]`).forEach(radio => radio.disabled = false);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Place Bet';
                    submitButton.style.backgroundColor = '#006400';
                    submitButton.style.borderColor = '#FFD700';
                    submitButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }
            }
        }

        // Update voter records display for ALL poll types
        updateVoterDisplay(pollName, pollData.voterRecords);
    };


    // Function to update the displayed list of voters
    const updateVoterDisplay = (pollName, voterRecords) => {
        const voterRecordsDiv = document.getElementById(`records-${pollName}`);
        if (!voterRecordsDiv) return;

        const voterListUl = voterRecordsDiv.querySelector('ul');
        if (!voterListUl) return;

        voterListUl.innerHTML = ''; // Clear existing list

        const names = Object.keys(voterRecords);
        if (names.length > 0) {
            voterRecordsDiv.style.display = 'block'; // Show the section
            // Sort names alphabetically for consistent display
            names.sort().forEach(name => {
                const option = voterRecords[name];
                const listItem = document.createElement('li');
                listItem.textContent = `${name} bet on: ${option}`;
                voterListUl.appendChild(listItem);
            });
        } else {
            voterRecordsDiv.style.display = 'none'; // Hide if no records
        }
    };


    // Load results for all polls on page load if on polls.html
    if (pollForm) { // Only run poll logic if pollForm exists (i.e., we are on polls.html)
        document.querySelectorAll('.poll-question').forEach(pollDiv => {
            const pollName = pollDiv.dataset.pollName;
            loadPollResults(pollName);
        });

        // Event listener for the global name input field
        if (globalNameInput) {
            globalNameInput.addEventListener('input', () => {
                // When the name changes, re-check all polls for voting status
                document.querySelectorAll('.poll-question').forEach(pollDiv => {
                    const pollName = pollDiv.dataset.pollName;
                    loadPollResults(pollName); // This will re-evaluate and disable/enable
                });
            });
        }

        // Event listener for form submission (voting)
        pollForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const clickedButton = event.submitter;
            if (!clickedButton || !clickedButton.classList.contains('polls-button')) {
                return; // Only proceed if a poll button was clicked
            }

            const pollName = clickedButton.dataset.poll;
            if (!pollName) {
                console.error('Poll name not found for the submitted button.');
                return;
            }

            const voterName = globalNameInput ? globalNameInput.value.trim() : '';

            if (voterName === '') {
                alert('Please enter your name in the field above before placing any bet!');
                return;
            }

            const pollQuestionDiv = document.querySelector(`.poll-question[data-poll-name="${pollName}"]`);

            // --- Handle text input polls (Weight, Date/Time) ---
            let inputValue = '';
            let isTextInputPoll = false;
            const pollInputText = pollQuestionDiv.querySelector('input[type="text"]');
            const pollInputDateTime = pollQuestionDiv.querySelector('input[type="datetime-local"]');

            // Determine if this is a text input poll based on the clicked button's pollName
            if (pollName === 'babyWeight' && pollInputText) {
                inputValue = pollInputText.value.trim();
                isTextInputPoll = true;
            } else if (pollName === 'deliveryDateTime' && pollInputDateTime) {
                inputValue = pollInputDateTime.value.trim();
                isTextInputPoll = true;
            }

            if (isTextInputPoll) { // This block will now only execute if the specific text/datetime poll was submitted
                if (inputValue === '') {
                    alert('Please enter your bet before placing it!');
                    return;
                }

                let pollData = JSON.parse(localStorage.getItem(`poll-${pollName}`));
                if (!pollData || !pollData.counts || !pollData.voterRecords) {
                    pollData = { counts: {}, voterRecords: {} };
                }

                // Check if voter has already voted for this specific text-based poll
                if (pollData.voterRecords[voterName]) {
                    alert(`You (as ${voterName}) have already placed your bet on this poll!`);
                    return;
                }

                // For text inputs, treat the entered value as the option
                pollData.counts[inputValue] = (pollData.counts[inputValue] || 0) + 1;
                pollData.voterRecords[voterName] = inputValue;

                localStorage.setItem(`poll-${pollName}`, JSON.stringify(pollData));
                loadPollResults(pollName); // Reload to update display and disable input
                return; // Exit as this poll type has been handled
            }

            // --- Handle radio button polls (original logic) ---
            const selectedOption = pollQuestionDiv.querySelector(`input[name="${pollName}"]:checked`);

            if (selectedOption) {
                let pollData = JSON.parse(localStorage.getItem(`poll-${pollName}`));
                if (!pollData || !pollData.counts || !pollData.voterRecords) {
                    pollData = { counts: {}, voterRecords: {} };
                }

                // --- "Vote once per name per poll" check ---
                if (pollData.voterRecords[voterName]) {
                    alert(`You (as ${voterName}) have already placed your bet on this poll!`);
                    return; // Prevent further action if already voted
                }

                const optionValue = selectedOption.value;

                // Increment vote count
                pollData.counts[optionValue] = (pollData.counts[optionValue] || 0) + 1;
                // Record voter name and their choice
                pollData.voterRecords[voterName] = optionValue;

                // Save updated poll data to localStorage
                localStorage.setItem(`poll-${pollName}`, JSON.stringify(pollData));

                // Update display for the specific poll
                loadPollResults(pollName); // This will also handle disabling

            } else {
                alert('Please select an option before placing your bet!');
            }
        });
    }
});