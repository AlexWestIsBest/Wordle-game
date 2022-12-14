let validateGuess = (evt) => {
    const guessCandidate = document.querySelector(`input`).value.toUpperCase()
    if (guessCandidate.length === 5) {
        if (!guessList.includes(guessCandidate)) {
            $.ajax(API_URL + `sp=` + guessCandidate).then(function(data) {
                if (data.length !== 0) {
                    if (data[0].word.toUpperCase() === guessCandidate && data[0].score > 1000) {
                        processGuess(guessCandidate)
                    }
                    else {
                        invalidGuess(`Not a real word`)
                        resetUI()
                    }
                }
                else {
                    invalidGuess(`Not a real word`)
                    resetUI()
                }
            })
        }
        else {
            invalidGuess(`Already used`)
            resetUI()
        }
    }
    else {
        invalidGuess(`Must be 5 letters`)
        resetUI()
    }
}

let invalidGuess = (message) => {
    let errorElement = document.createElement(`h5`)
    errorElement.textContent = `${message}`
    $(`input`).attr(`placeholder`,`${message}`)
    document.querySelector(`input`).style.backgroundColor = `rgb(238, 46, 49)`
    setTimeout(function(){
        $(`input`).attr(`placeholder`,`Enter a 5-letter word`)
        document.querySelector(`input`).style.backgroundColor = `rgba(255,255,255,0)`
    }, 1800)
}

let resetUI = () => {
    document.querySelector(`input`).value = ``
    $(`input`).focus()
}

let processGuess = (currentGuess) => {
    // Create color code
    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === todaysWordle.charAt(i))
            colorCode += '☑'
        else if (todaysWordle.includes(currentGuess[i]))
            colorCode += '☐'
        else colorCode += '☒'
    }
    colorCodes.push(colorCode)
    colorCode = ''

    // Update HTML guess list
    const listItem = document.createElement(`h3`)
    listItem.textContent = `${currentGuess} - ${colorCodes[colorCodes.length - 1]}`
    document.querySelector(`.list`).appendChild(listItem)

    // Check guess
    if (currentGuess === todaysWordle) {
        alert(`Woohoo! You won!`)
        window.location.reload()
        return
    }
    guessList.push(currentGuess)

    // Count guesses
    guessesRemaining -= 1
    if (guessesRemaining === 0) {
        alert(`Alas! Game over!`)
        window.location.reload()
        return
    }
    $(`#guessCount`).empty().html(`Guesses remaining: ${guessesRemaining}`)
    if (guessesRemaining === 1) $(`#guessCount`).empty().html(`This is your last chance!`)

    // API hints
    let hintElement = document.createElement(`h4`)
    if (guessesRemaining === 3) {
        // Part of speech
        $.ajax(API_URL + `sp=` + todaysWordle + `&md=p`).then(function(data) {
            const partOfSpeech = data[0].tags[0]
            let firstHint = ``
            if (partOfSpeech === `n`) firstHint = `Today's wordle is a noun.`
            else if (partOfSpeech === `v`) firstHint = `Today's wordle is a verb.`
            else if (partOfSpeech === `adj`) firstHint = `Today's wordle is an adjective.`
            else if (partOfSpeech === `adv`) firstHint = `Today's wordle is an adverb.`
            hintElement.textContent = `Hint: ${firstHint}`
            document.querySelector(`body`).appendChild(hintElement)
        })
    }
    if (guessesRemaining === 2) {
        // Trigger words
        $.ajax(API_URL + `rel_trg=` + todaysWordle).then(function(data) {
            let secondHint = `${data[0].word}, ${data[1].word}, ${data[2].word}...`
            secondHint = secondHint[0].toUpperCase() + secondHint.substring(1)
            hintElement.textContent = `Related Words: ${secondHint}`
            document.querySelector(`body`).appendChild(hintElement)
        })
    }
    if (guessesRemaining === 1) {
        // Definition
        $.ajax(API_URL + `sp=` + todaysWordle + `&md=d`).then(function(data) {
            let finalHint = `${data[0].defs[0]}`
            finalHint = finalHint[2].toUpperCase() + finalHint.substring(3)
            hintElement.textContent = `Definition: ${finalHint}.`
            document.querySelector(`body`).appendChild(hintElement)
        })
    }

    resetUI()
}

// Variables
const wordleList = [`WORLD`, `RIGHT`, `PLACE`, `WATER`, `POINT`, `HUMAN`, `PARTY`, `COURT`, `TABLE`, `STUDY`, `WORDS`, `LIGHT`, `MONEY`, `SOUTH`, `NORTH`, `FIELD`, `MAJOR`, `HEART`, `TRADE`, `MODEL`, `GRANT`, `SOCKS`, `SHOES`, `BRUSH`]
let todaysWordle = wordleList[Math.floor(Math.random() * 20)]
const d = new Date
todaysWordle = wordleList[d.getHours()]
console.log(`The answer definitely isn't ${todaysWordle}`)
let API_URL = "https://api.datamuse.com/words?"
let guessList = []
let colorCode = ''
let colorCodes = []
let guessesRemaining = 6
const $btn = $(`button`)
const $input = $(`input`)

// Ease of use
$(`input`).focus()
$(document).on(`click`, (e) => $(`input`).focus())
$btn.on(`click`, validateGuess)
$(`input`).keyup((e) => {
    const keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode == '13') validateGuess()
})