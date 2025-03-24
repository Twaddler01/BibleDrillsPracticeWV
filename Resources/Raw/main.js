// Global variables to store data
let bibleVerses = [];
let keyPassages = [];
let bibleBooks = [];

const jsonFiles = {
    bibleVerses: 'json/bibleVerses.json',
    keyPassages: 'json/keyPassages.json',
    bibleBooks: 'json/bibleBooks.json'
};

// Function to load all JSON files dynamically
async function loadAllJsonFiles() {
    try {
        const fetchPromises = Object.entries(jsonFiles).map(async ([key, path]) => {
            const response = await fetch(path);
            const data = await response.json();
            return { key, data };
        });

        const results = await Promise.all(fetchPromises);

        // Assign the loaded data to the global variables
        results.forEach(({ key, data }) => {
            if (key === "bibleVerses") bibleVerses = data;
            if (key === "keyPassages") keyPassages = data;
            if (key === "bibleBooks") bibleBooks = data;
        });

    } catch (error) {
        console.error("Error loading JSON files:", error);
    }
}

loadAllJsonFiles();

// Load DOM
document.addEventListener("DOMContentLoaded", () => {

    class DraggableWindow {
        constructor(title, content) {
            this.title = title;
            this.content = content;
            this.createWindow();
        }
    
        createWindow() {
            // Create main window div
            this.windowDiv = document.createElement('div');
            this.windowDiv.classList.add('draggable-window');
    
            // Create title bar
            this.titleBar = document.createElement('div');
            this.titleBar.classList.add('title-bar');
    
            // Create title text
            this.titleText = document.createElement('span');
            this.titleText.textContent = this.title;
            
            // Create close button
            this.closeButton = document.createElement('button');
            this.closeButton.classList.add('close-button');
            this.closeButton.textContent = '×'; // "×" is a nicer-looking X
    
            // Append title and close button
            this.titleBar.appendChild(this.titleText);
            this.titleBar.appendChild(this.closeButton);
    
            // Create content area
            this.contentDiv = document.createElement('div');
            this.contentDiv.classList.add('content-area');
    
            // Append the content
            if (this.content instanceof HTMLElement) {
                this.contentDiv.appendChild(this.content);
            } else {
                this.contentDiv.innerHTML = this.content;
            }
    
            // Append elements
            this.windowDiv.appendChild(this.titleBar);
            this.windowDiv.appendChild(this.contentDiv);
            document.body.appendChild(this.windowDiv);
    
            // Close window event listener
            this.closeButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent drag interference
                this.closeWindow();
            });
            
            // Also prevent touch interference on mobile
            this.closeButton.addEventListener('touchstart', (event) => {
                event.stopPropagation(); // Stop touch event from triggering drag
                this.closeWindow();
            }, { passive: false });
            
            // Enable dragging
            this.makeDraggable();
        }
    
        makeDraggable() {
            let offsetX = 0, offsetY = 0, isDragging = false;
    
            const startDrag = (e) => {
                isDragging = true;
    
                let clientX = e.clientX || e.touches[0].clientX;
                let clientY = e.clientY || e.touches[0].clientY;
    
                offsetX = clientX - this.windowDiv.offsetLeft;
                offsetY = clientY - this.windowDiv.offsetTop;
    
                this.windowDiv.style.zIndex = 1000; // Bring to front
    
                e.preventDefault();
            };
    
            const doDrag = (e) => {
                if (!isDragging) return;
    
                let clientX = e.clientX || e.touches[0].clientX;
                let clientY = e.clientY || e.touches[0].clientY;
    
                this.windowDiv.style.left = `${clientX - offsetX}px`;
                this.windowDiv.style.top = `${clientY - offsetY}px`;
            };
    
            const stopDrag = () => { isDragging = false; };
    
            // Mouse Events
            this.titleBar.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);
    
            // Touch Events
            this.titleBar.addEventListener('touchstart', startDrag, { passive: false });
            document.addEventListener('touchmove', doDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        }

        moveToCenter() {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const windowWidth = this.windowDiv.offsetWidth;
            const windowHeight = this.windowDiv.offsetHeight;
            
            // Calculate center position
            const left = (viewportWidth - windowWidth) / 2;
            const top = (viewportHeight - windowHeight) / 2;
            
            // Apply new position
            this.windowDiv.style.position = 'fixed'; // Ensure it's positioned relative to the viewport
            this.windowDiv.style.left = `${left}px`;
            this.windowDiv.style.top = `${top}px`;
            this.windowDiv.style.zIndex = '1000'; // Bring to front
        }

        closeWindow() {
            this.windowDiv.remove();
        }
    }

// Example Usage:
//new DraggableWindow("Timer", "<p>This is a draggable window!</p>");

// Example Usage (2):
// Pass the container to DraggableWindow
//new DraggableWindow("Timer", divContainer);

class CountdownTimer {
    constructor(containerId, totalTime) {
        this.container = document.getElementById(containerId);
        this.totalTime = totalTime;
        this.remainingTime = totalTime;
        this.blocks = [];
        this.interval = null;
        this.timeIsUp = false;
        this.createUI();
    }

    createUI() {
        this.container.innerHTML = ''; // Clear previous content
        this.blocks = [];

        // Wrapper for styling
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('timer-wrapper');

        // Progress Bar Container
        this.progressBar = document.createElement('div');
        this.progressBar.classList.add('progress-bar');
        this.progressBar.style.visibility = 'hidden'; // Initially hidden

        // Create blocks for countdown
        this.displayBlocks = this.totalTime;

        for (let i = 0; i < this.displayBlocks; i++) {
            let block = document.createElement('div');
            block.classList.add('block');
            block.style.visibility = 'hidden'; // Initially hidden
            block.style.backgroundColor = 'lightgreen';
            block.style.width = `${100 / this.displayBlocks}%`;
            this.blocks.push(block);
            this.progressBar.appendChild(block);
        }

        // Status Text
        this.statusText = document.createElement('div');
        this.statusText.classList.add('status-text');
        this.statusText.textContent = 'READY';

        // Buttons Container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.classList.add('button-container');

        // Start Button
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'Start';
        this.startButton.addEventListener('click', () => this.start());

        // Reset Button
        this.resetButton = document.createElement('button');
        this.resetButton.textContent = 'Reset';
        this.resetButton.addEventListener('click', () => this.reset());

        // Append buttons to button container
        this.buttonContainer.appendChild(this.startButton);
        this.buttonContainer.appendChild(this.resetButton);

        // Append elements to wrapper
        this.wrapper.appendChild(this.progressBar);
        this.wrapper.appendChild(this.statusText);
        this.wrapper.appendChild(this.buttonContainer);
        this.container.appendChild(this.wrapper);
    }

    start() {
        if (this.interval) return; // Prevent multiple intervals

        if (this.timeIsUp) {
            // Reset state if restarting
            this.timeIsUp = false;
            this.remainingTime = this.totalTime;
            this.blocks.forEach(block => {
                block.style.visibility = 'visible';
                block.style.backgroundColor = 'lightgreen';
            });
        }

        // Show the progress bar when starting
        this.progressBar.style.visibility = 'visible';
        this.blocks.forEach(block => block.style.visibility = 'visible');

        this.statusText.textContent = this.remainingTime; // Set initial countdown display

        this.interval = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;

                let blockIndex = this.totalTime - this.remainingTime - 1;

                // Remove blocks from **RIGHT to LEFT**
                if (blockIndex < this.blocks.length) {
                    let reverseIndex = this.blocks.length - 1 - blockIndex;
                    this.blocks[reverseIndex].style.visibility = 'hidden';
                }

                // Calculate percentage remaining
                let percentage = (this.remainingTime / this.totalTime) * 100;

                // Change colors based on percentage
                let color = percentage <= 20 ? 'red' :
                            percentage <= 40 ? 'yellow' : 'lightgreen';

                // Apply color change to visible blocks
                this.blocks.forEach(block => {
                    if (block.style.visibility === 'visible') {
                        block.style.backgroundColor = color;
                    }
                });

                this.statusText.textContent = this.remainingTime > 0 ? this.remainingTime : 'TIME IS UP!';
            } else {
                this.stop();
                this.timeIsUp = true;
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset() {
        this.stop();
        this.remainingTime = this.totalTime;
        this.timeIsUp = false;
        this.createUI();
        this.statusText.textContent = 'READY';
    }
}
/*
// Usage example:
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer('timer-container', 10); // Only need to provide parent ID
});
*/

    class ProgressBar {
        constructor({ parentId, val = 0, total = 0 } = {}) {
            this.val = val;
            this.total = total;
            this.parentId = parentId;
        }

        create() {
            const parent_element = document.getElementById(this.parentId);
            if (!parent_element) {
                console.error(`Parent element with ID "${this.parentId}" not found.`);
                return;
            }

            let progress_percent = this.total > 0 ? (this.val / this.total) * 100 : 0;
            progress_percent = Math.round(progress_percent * 10) / 10;

            parent_element.innerHTML = `
            <div id="status_bar_container" style="width: 100%; border: solid 1px black; box-sizing: border-box; padding: 5px;">
                <div class="bar_with_border_container container" style="position: relative; width: 100%; height: 30px; border-radius: 5px; overflow: hidden;">
                    <div class="bar_with_border_fill" style="background-color: green; width: ${progress_percent}%; height: 100%; transition: width 0.3s ease;"></div>
                    <span class="bar_with_border_text">
                        ${this.val >= this.total ? "COMPLETE" : `Progress: ${this.val} / ${this.total}`}
                    </span>
                </div>
            </div>
            `;
        }

        update(val, total) {
            this.val = val;
            this.total = total;
            this.create();
        }
    }

    class DrillCall {
        constructor({ verse_ul = "", verse = "", ref = "", color = "", vers = "", name = "", book = "", ba = "" } = {}) {
            this.verse_ul = verse_ul;
            this.verse = verse;
            this.ref = ref;
            this.color = color;
            this.vers = vers;
            this.name = name;
            this.book = book;
            this.ba = ba;
            this.answerVisible = false;
        }

        toggleAnswer() {
            this.answerVisible = !this.answerVisible;
        }

        formatCall(type) {
            let formatted = '';
        
            switch (type) {
                case 1:
                    formatted = `<strong><u>${this.verse_ul}</u></strong>`;
                    formatted += `<span style="visibility: ${this.answerVisible ? 'visible' : 'hidden'};"> ${this.verse}<br>- ${this.ref}</span>`;
                    break;
        
                case 2:
                    formatted = `<strong>${this.ref}</strong>`;
                    formatted += `<br><span style="visibility: ${this.answerVisible ? 'visible' : 'hidden'};">${this.verse_ul} ${this.verse}</span>`;
                    break;
        
                case 3:
                    formatted = `<strong>${this.name}</strong>`;
                    formatted += `<br><span style="visibility: ${this.answerVisible ? 'visible' : 'hidden'};">${this.ref}</span>`;
                    break;
        
                case 4:
                    formatted = `<strong>${this.book}</strong>`;
                    formatted += `<br><span style="visibility: ${this.answerVisible ? 'visible' : 'hidden'};">${this.ba}</span>`;
                    break;
            }
        
            return formatted;
        }
    }

    let selectedVersion = "";
    let selectedColor = "";
    let selectedColorText = "";
    let filteredVerses = [];
    let currentVerseIndex = 0; // Start at first verse (0)
    let drill;
    let progressBar;

    function filterVerses(arg_selectedCallType) {

        const drillData = {
            'call1': bibleVerses,
            'call2': bibleVerses,
            'call3': keyPassages,
            'call4': bibleBooks
        };
    
        // Ensure the selected call type exists in the mapping
        const selectedArray = drillData[arg_selectedCallType] || [];

        // Check if the selected array contains objects with a 'book' property
        if (selectedArray.length > 0 && 'book' in selectedArray[0]) {
            filteredVerses = selectedArray; // Include as-is
        } else {
            // Filter based on selected version and color
            filteredVerses = selectedArray.filter(v => 
                (!v.vers || v.vers === selectedVersion) && v.color === selectedColor
            );
        }
        
        // Shuffle the filtered verses
        filteredVerses.sort(() => Math.random() - 0.5);
        
        currentVerseIndex = 0; // Start at first verse

        if (filteredVerses.length === 0) {
            return;
        }

        const progressBarContainer = document.getElementById('progressBarContainer');
        if (progressBarContainer) {
            progressBar = new ProgressBar({ parentId: "progressBarContainer", val: 0, total: filteredVerses.length });
            progressBar.create();
        }

        loadVerse(arg_selectedCallType);
    }

    function loadVerse(arg_selectedCallType) {
        if (filteredVerses.length === 0 || currentVerseIndex >= filteredVerses.length) return;

        const verseData = filteredVerses[currentVerseIndex];
        drill = new DrillCall(verseData);
        updateDisplay(arg_selectedCallType);
    }

    function updateDisplay(arg_selectedCallType) {
        const verseContainer = document.getElementById("verseContainer");
        if (verseContainer && arg_selectedCallType === 'call1') verseContainer.innerHTML = drill.formatCall(1);
        if (verseContainer && arg_selectedCallType === 'call2') verseContainer.innerHTML = drill.formatCall(2);
        if (verseContainer && arg_selectedCallType === 'call3') verseContainer.innerHTML = drill.formatCall(3);
        if (verseContainer && arg_selectedCallType === 'call4') verseContainer.innerHTML = drill.formatCall(4);
        const toggleButton = document.getElementById("toggleButton");
        if (toggleButton) toggleButton.innerText = drill.answerVisible ? "Hide Answer" : "See Answer";
    }

    function nextVerse(arg_selectedCallType) {
        if (currentVerseIndex + 1 >= filteredVerses.length) {
            completeDrill();
            return;
        }

        currentVerseIndex++;
        loadVerse(arg_selectedCallType);

        const progressBarContainer = document.getElementById('progressBarContainer');
        if (progressBarContainer && progressBar) {
            progressBar.update(currentVerseIndex, filteredVerses.length);
        }
    }

    function completeDrill() {
        document.getElementById("verseContainer").innerHTML = "Drill complete! Well done!";
        document.getElementById("nextButton").style.display = "none"; // Hide "Next Verse"
        document.getElementById("toggleButton").style.display = "none"; // Hide "See Answer"
        document.getElementById("startOverButton").style.display = "inline-block"; // Show "Start Over"
        progressBar.update(filteredVerses.length, filteredVerses.length); // Ensure full progress
    }

    const docContainer = document.createElement('div');
    docContainer.id = 'docContainer';
    document.body.appendChild(docContainer);
    docContainer.style.width = '90%';

    docContainer.innerHTML = `
        <h2>BIBLE DRILLS PRACTICE</h2>
        <div id="selectDiv"></div>
        <div id="selectedOpts"></div>
        <div id="start_div">
            <button id="start_btn">Start Practice</button>
        </div>
        <br>
        <div id="callTypeDiv"></div>
        <div id="drillContainer"></div>
        <div id="progress-bar"></div>
    `;

    function setupDrillVersionColor() {
        // Clear all sections
        const callTypeDiv = document.getElementById("callTypeDiv");
        if (callTypeDiv) callTypeDiv.innerHTML = '';
        const drillContainer = document.getElementById('drillContainer');
        if (drillContainer) drillContainer.innerHTML = '';

        selectedVersion = "";
        selectedColor = "";
        selectedColorText = "";
        updateSelectedOptions();
        document.getElementById("selectDiv").innerHTML = `   
            <span><b>Choose book version and color:</b></span><br>
            <select id="versionSelect">
                <option value="" selected>---</option>
                <option value="kjv">KJV</option>
                <option value="csb">CSB</option>
            </select>
            <select id="colorSelect">
                <option value="" selected>---</option>
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
            </select>
        `;
        
        document.getElementById("versionSelect").addEventListener("change", (e) => {
            selectedVersion = e.target.value;
            updateSelectedOptions();
            filterVerses();
        });
    
        document.getElementById("colorSelect").addEventListener("change", (e) => {
            selectedColorText = e.target.options[e.target.selectedIndex].text;
            selectedColor = e.target.value;
            updateSelectedOptions();
            filterVerses();
        });
    }
    setupDrillVersionColor();

    function updateSelectedOptions() {
        document.getElementById('selectedOpts').innerHTML = `<b>Selected Version:</b> ${selectedVersion.toUpperCase()}<br><b>Selected Color:</b> ${selectedColorText}`;
        const start_btn = document.getElementById('start_btn');
        if (!start_btn) {
            const start_div = document.getElementById('start_div');
            start_div.innerHTML = '<button id="start_btn">Start Practice</button>';
            choose_options();
        }
    }
    updateSelectedOptions();
    
    // Chosen options
    function choose_options() {
        document.getElementById('start_btn').addEventListener("click", () => {
            if (selectedVersion === '' || selectedColor === '') {
                document.getElementById('selectedOpts').innerHTML = 'Please choose a Color and Version';
                return;
            }
            document.getElementById("selectDiv").innerHTML = '';
            document.getElementById('start_btn').remove();
            const start_div = document.getElementById('start_div');
            start_div.innerHTML = '<button id="reset_btn">Select Different Color or Version</button>';
            document.getElementById('reset_btn').addEventListener("click", () => {
                setupDrillVersionColor();
            });
            
            setupDrillCall();
            filterVerses();
        });
    }
    choose_options();
    
    function setupDrillCall() {
        document.getElementById("callTypeDiv").innerHTML = `   
            <span><b>Choose call type:</b></span><br>
            <form id="callTypeForm">
            <div><label><input type="radio" name="option" value="call1"> Completion Call</label></div>
            <div><label><input type="radio" name="option" value="call2"> Quotation Call</label></div>
            <div><label><input type="radio" name="option" value="call3"> Key Passage Call</label></div>
            <div><label><input type="radio" name="option" value="call4"> Book Call</label></div>
            </form>
        `;

        let selectedCallType = "";

        document.getElementById("callTypeForm").addEventListener("change", function() {
            selectedCallType = document.querySelector('input[name="option"]:checked').value;

            let selectedOption = document.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                let selectedText = selectedOption.parentElement.textContent.trim();

                document.getElementById("callTypeDiv").innerHTML = `
                    <span><b>Call type:</b></span><br>
                    ${selectedText}<br>
                    <button id="changeCall_btn">Select Different Drill</button>
                `;
                
                document.getElementById('changeCall_btn').addEventListener("click", () => {
                    document.getElementById("drillContainer").innerHTML = '';
                    setupDrillCall();
                });

                function setupDrillContainer() {
                    document.getElementById("drillContainer").innerHTML = `
                        <span><h3>DRILL PRACTICE:</h3></span>
                        <div id="verseContainer" class="container" style="padding-bottom: 10px;"></div>
                        <button id="toggleButton">See Answer</button>
                        <button id="nextButton">Next Drill</button>
                        <button id="startOverButton" style="display: none;">Start Over</button>
                        <div id="progressBarContainer"></div>
                        <h2>TOOLS</h2>
                        <button id="showTimer">Show 10 second Timer</button>
                    `;
            
                    const showTimerButton = document.getElementById("showTimer");
                    let timerWindow = null; // Track the timer window
                    
                    // Function to create the timer
                    function createTimer() {
                        // Create a new progress-bar div
                        const progressBarDiv = document.createElement('div');
                        progressBarDiv.id = 'progress-bar';
                    
                        // Append progress-bar as the first child of docContainer
                        docContainer.prepend(progressBarDiv);
                    
                        // Initialize the timer
                        new CountdownTimer('progress-bar', 10);
                    
                        return progressBarDiv;
                    }
                    
                    showTimerButton.addEventListener("click", () => {
                        if (timerWindow) {
                            // If window exists, remove it and reset button text
                            timerWindow.closeWindow();
                            timerWindow = null;
                            showTimerButton.textContent = "Show 10 Second Timer";
                        } else {
                            // Create and insert the timer inside docContainer
                            const progressBarDiv = createTimer();
                    
                            // Create the draggable window
                            timerWindow = new DraggableWindow("Timer", progressBarDiv);
                            timerWindow.moveToCenter();
            
                            // Update button text
                            showTimerButton.textContent = "Hide 10 Second Timer";
                    
                            // Ensure closing also resets the button
                            const originalClose = timerWindow.closeWindow.bind(timerWindow);
                            timerWindow.closeWindow = function () {
                                originalClose();
                                timerWindow = null;
                                showTimerButton.textContent = "Show 10 Second Timer";
                            };
                        }
                    });
            
                    document.getElementById("toggleButton").addEventListener("click", () => {
                        if (drill) {
                            drill.toggleAnswer();
                            updateDisplay(selectedCallType);
                        }
                    });
                
                    document.getElementById("nextButton").addEventListener("click", () => {
                        nextVerse(selectedCallType);
                    });                    
                    
                    document.getElementById("startOverButton").addEventListener("click", startOver);

                    filterVerses(selectedCallType);
                }
                
                function startOver() {
                    currentVerseIndex = 0;
                    progressBar.update(0, filteredVerses.length);
                    setupDrillContainer();
                }
                setupDrillContainer();
            }
        });

    }

});