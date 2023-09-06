const container = document.querySelector('.container');

const startPageTitle = 'Welcome';
const startQuizButton = 'Start Quiz';
const backToQuizButtonText = 'Back to Quiz';
const nextButtonText = 'Next';
const noQuestionsErrorMessage = '[Error]: No questions fetched';
const networkErrorMessage = '[Error]: Network error';
const nbQuestions = 5;
const difficulities = [{
    text: 'Easy',
    value: 'easy',
}, {
    text: 'Medium',
    value: 'medium',
}, {
    text: 'Hard',
    value: 'hard',
}];

let currentQuestionIndex = 0;
let intervalId;
let counter = 20;
let difficulty = 'easy';
let apiUrl = 'https://opentdb.com/api.php';
let questions = [];
let quizStarted = false;


// display the current question
function displayQuestion() {
    if (currentQuestionIndex === 0) {
        createQuizeContainer()
    }
    addOptions()
}

// start the quiz
async function startQuiz() {
    isQuizStarted = await getQuestions();
    if (isQuizStarted) {
        hideStartPage()
        displayQuestion();
    }
}

function displayStartPage() {
    // prepare start page elements title, select difficulty options and start button
    const difficultyContainer = prepareHtmlElement('div', 'difficulty')
    const welcome = document.createElement('h2');
    welcome.textContent = startPageTitle;
    const selectDifficulity = prepareHtmlElement('select', 'difficulty-select')
    selectDifficulity.addEventListener('change', () => handleDifficultyChange());

    // create select difficulty options
    difficulities.forEach(difficulty => {
        const optionDifficulity = document.createElement('option');
        optionDifficulity.textContent = difficulty.text
        optionDifficulity.setAttribute('value', difficulty.value)
        selectDifficulity.appendChild(optionDifficulity);
    })

    //prepare start button element
    const startButton = prepareHtmlElement('button', 'start-button')
    startButton.textContent = startQuizButton;
    startButton.addEventListener('click', () => startQuiz());

    // add created elements to the container
    appendChildren(difficultyContainer, [welcome, selectDifficulity, startButton])
    container.appendChild(difficultyContainer);
}

// delete the start page component for the DOM
function hideStartPage() {
    const difficultyContainer = document.querySelector('.difficulty');
    difficultyContainer.remove();
}

// delete the created questions for the DOM
function hideQuestions() {
    const questionContainer = document.querySelector('.question-container');
    questionContainer.remove();
}
// start timer
function startTimer() {
    document.querySelector(".time-counter").textContent = counter;
    if (intervalId) {
        stopTimer()
    }
    intervalId = setInterval(timer, 1000);
}

// stop time and clear interval 
function stopTimer() {
    clearInterval(intervalId);
    counter = 20;
}

// counter 
function timer() {
    counter--;
    document.querySelector(".time-counter").textContent = counter;
    if (counter === 0) {
        stopTimer();
        handleNextClick()
    }
}

// resolve special characters in questions and answers
function resolveSpecialCharactersInQuestionsAndAnswers() {
    questions.forEach(question => {
        question.question = resolveSpecialCharacters(question.question);
        question.correct_answer = resolveSpecialCharacters(question.correct_answer);
        question.incorrect_answers = question.incorrect_answers.map(resolveSpecialCharacters);
    });
}

// resolve special characters in text
function resolveSpecialCharacters(text) {
    const element = document.createElement('div');
    element.innerHTML = text;
    return element.textContent || element.innerText;
}

// shuffle an array 
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// append children to a parent node
function appendChildren(parent, children) {
    children.forEach(element => { parent.appendChild(element) }
    )
}

// create html element with selector and class name 
function prepareHtmlElement(selector, className) {
    const element = document.createElement(selector)
    if (className) {
        element.classList.add(className);
    }
    return element;
}

// fetch questions from the API
async function getQuestions() {
    const url = `${apiUrl}?amount=${nbQuestions}&difficulty=${difficulty}&type=multiple`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length > 0) {
            questions = data.results;

            // resolve special caraters from text (&#177;, &#8220; ... )
            resolveSpecialCharactersInQuestionsAndAnswers();
            return true;
        } else {
            console.error(noQuestionsErrorMessage);
            return false;
        }
    } catch (error) {
        console.error(networkErrorMessage, error);
        return false;
    }
}

// add question options
function addOptions() {
    const currentQuestion = questions[currentQuestionIndex];
    const questionText = document.querySelector('.question-text');
    questionText.innerHTML = currentQuestion.question;
    const optionsContainer = document.querySelector('.options-container');

    // Prepare options container
    optionsContainer.innerHTML = '';

    const options = shuffleArray(
        currentQuestion.incorrect_answers.concat(currentQuestion.correct_answer)
    );

    // Create options nodes
    options.forEach(answer => {
        const optionButton = prepareHtmlElement('button', 'option')
        optionButton.textContent = answer;
        optionButton.addEventListener('click', () => checkAnswer(answer));

        // Add option to the container
        optionsContainer.appendChild(optionButton);
    });

    // prepare navigation container
    const navigationContainer = prepareHtmlElement('div', 'next-button-container')

    // prepare timer node
    const timeCounter = prepareHtmlElement('h3', 'time-counter')
    timeCounter.textContent = counter;

    //prepare node for next button
    const nextButton = prepareHtmlElement('button', 'next-button')

    // set next button text to be next or back to quiz to go to the satrt page
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.textContent = backToQuizButtonText;
    } else {
        nextButton.textContent = nextButtonText;
    }

    // add listener to the next button
    nextButton.addEventListener('click', () => handleNextClick());

    // add counter node and next button node to the navigation container
    appendChildren(navigationContainer, [nextButton, timeCounter])

    // add the navigation container to the quize container
    optionsContainer.appendChild(navigationContainer);
    startTimer()

}

// handle difficulty selection change
function handleDifficultyChange() {
    const difficultySelect = document.querySelector(".difficulty-select");
    difficulty = difficultySelect.value;
}

// move to the next question
function handleNextClick() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else if (currentQuestionIndex === questions.length - 1) {
        hideQuestions()
        displayStartPage()
        currentQuestionIndex = 0
        stopTimer()
    }
}
// check if the selected answer is correct
function checkAnswer(selectedAnswer) {

    // get current question
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correct_answer;

    // get question options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {

        // disable selection
        option.disabled = true;
        if (option.textContent === selectedAnswer) {

            // set css class 
            if (selectedAnswer === correctAnswer) {
                option.classList.add('selected-correct');
            } else {
                option.classList.add('selected-incorrect');
            }
        }
    });
}

function createQuizeContainer() {
    const questionContainer = prepareHtmlElement('div', 'question-container')
    const questionText = prepareHtmlElement('p', 'question-text')
    const optionsContainer = prepareHtmlElement('div', 'options-container')
    const title = document.createElement('h2')
    title.textContent = 'Quiz';

    appendChildren(questionContainer, [title, questionText, optionsContainer])
    container.appendChild(questionContainer);
}

// launch quiz game
displayStartPage()