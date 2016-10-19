/*
Author: Mats Wikmar
Github: mow-github
Email: matwik@gmail.com
Date: 2016-10-19
*/

window.onload = function(){

  /*execute this after the DOM and external resources are loaded*/
  /*holders for ref to the DOM*/
  let form            = document.forms[0];
  let formDivs        = form.getElementsByClassName("alert");
  let submitBtn       = document.getElementsByClassName("submitBtn")[0];
  let formGuess       = document.getElementById("formGuess");
  let formGuessBtn    = formGuess.getElementsByClassName("submitBtn")[0];
  let formResetBtn    = formGuess.getElementsByClassName("resetBtn")[0];
  let dataContainer   = document.getElementById("dataContainer");
  let formObj         = {totalPoints:0};
  let error_msg_flag  = true;

  /*holder for stats*/
  let gameNr = 0;
  let nrOfGuesses = 0;
  let nrOfGuessesLow = 0;
  let nrOfGuessesHigh = 0;

  /*if one clicks the submitBtn.. run the function*/
  submitBtn.addEventListener("click", submitBtnFunc, false);
  formGuessBtn.addEventListener("click", formGuessBtnFunc, false);
  formResetBtn.addEventListener("click", formResetBtnFunc, false);

  /*create a game if the validation passed*/
  function submitBtnFunc(event){
    /*prevent the submitBtn from executing a normal "send form request" */
    event.preventDefault();

    if( validateInputData() ){
      outputConsoleMsg("Validatation completed, creating a new game");
      generateRandomNumber();
      toggleView("none","block");
    }
  }

  /*set flag to true if no errors*/
  function validateInputData(){
    let flag = true;

    /*hide all error-divs*/
    for(let i = 0; i < formDivs.length; i++){ formDivs[i].style.display = "none"; }
    let formInputs = document.forms[0].getElementsByClassName("inputField");

    /*check every input value with a regexp and add data to an object*/
    for(let i = 0; i < formInputs.length; i++){
      if( formInputs[i].value === "" ){ displayErrorMsg(i,"Empty strings are not allowed"); }
      if( formInputs[i].id === "username" && (formInputs[i].value).match(/\d+/g)  !== null ){ displayErrorMsg(i,"Numbers are not allowed"); }
      if( formInputs[i].id !== "username" && (formInputs[i].value).match(/^[0-9]+$/g)  === null ){ displayErrorMsg(i,"It must be a number"); }
      formObj[formInputs[i].id] = formInputs[i].value;
    }
    if( Number(formObj.intervalMin) >= Number(formObj.intervalMax) ){ displayErrorMsg("intervalMax","It must be larger than the min number"); }

    /*display a custom error msg*/
    function displayErrorMsg(i,msg){
      flag = false;
      formInputs[i].parentNode.children[2].style.display = "block";
      formInputs[i].parentNode.children[2].innerHTML = msg;
    }
    return flag;
  }

  /*assign a random number(the user has to guess it) and increment the current game by 1*/
  function generateRandomNumber(){
    let min = Number(formObj.intervalMin);
    let max = Number(formObj.intervalMax);
    formObj.randomNumber = Math.floor(Math.random()*(max-min+1)+min);
    gameNr++;
    outputConsoleMsg("Generated a new random number: "+formObj.randomNumber);
    outputConsoleMsg(formObj);
  }

  /*switch between "page1" and "page2" */
  function toggleView(form1value, form2value){
    form.style.display = form1value;
    formGuess.style.display = form2value;
  }

  /*tracks your guesses.. if to low,high or the correct answer*/
  function formGuessBtnFunc(event){
    event.preventDefault();

    outputConsoleMsg("You guessed: "+formGuess.children[0].children[1].value);

    let userValue = Number(formGuess.children[0].children[1].value);
    if( userValue < formObj.randomNumber ){
      outputConsoleMsg("Enter a larger number");
      incNrOfGuessesByOne(true,true,false);
    }
    else if( userValue > formObj.randomNumber ){
      outputConsoleMsg("Enter a smaller number");
      incNrOfGuessesByOne(true,false,true);
    }
    else if( userValue === formObj.randomNumber ){
      outputConsoleMsg("YOU WON -- added 1p and generated a new game -- take a new guess or return to the game menu");

      incNrOfGuessesByOne(true, false, false);
      incPointsByOne();

      /*create an object for this game and add it to the parent object*/
      let currentGame = {game: gameNr, nrOfGuesses: nrOfGuesses, nrOfGuessesLow: nrOfGuessesLow, nrOfGuessesHigh: nrOfGuessesHigh, timestampDone: new Date().toLocaleString() };
      formObj["game"+gameNr] = currentGame;
      outputDataOnPage(currentGame);
      resetCounters();
      /*start a new game */
      generateRandomNumber();
    }
  }

  /*if one clicks the resetBtn: go back to "page1" and clear the data */
  function formResetBtnFunc(event){
    event.preventDefault();
    toggleView("block","none");
    clearOutputDataOnPage();
  }

  /*inc totalPoints by 1*/
  function incPointsByOne(){ formObj.totalPoints += 1; }

  /*inc by 1 depending on the guessed value vs the random value*/
  function incNrOfGuessesByOne(all, low, high){
    all ? nrOfGuesses += 1 : nrOfGuesses += 0;
    low ? nrOfGuessesLow += 1 : nrOfGuessesLow += 0;
    high ? nrOfGuessesHigh += 1 : nrOfGuessesHigh += 0;

    outputConsoleMsg("nrOfGuesses: "+nrOfGuesses);
    outputConsoleMsg("nrOfGuessesLow: "+nrOfGuessesLow);
    outputConsoleMsg("nrOfGuessesHigh: "+nrOfGuessesHigh);
  }

  /*add the current object to the page with: | Game nr |	x  guesses	| x  guesses(low) |	x guesses(high) |	time done*/
  function outputDataOnPage(currentGame){
    let tr = document.createElement('tr');
    dataContainer.appendChild(tr);

    /*Object.keys fetches an assoc array with all data in the object*/
    for(let i = 0; i < Object.keys(currentGame).length; i++){
      let currentKey = Object.keys(currentGame)[i];

      let td = document.createElement('td');
      tr.appendChild(td);
      let txt = document.createTextNode(currentGame[currentKey]);
      td.appendChild(txt);
    }

  }

  /*loop and remove the firstChild inside the dataContainer*/
  function clearOutputDataOnPage() { while (dataContainer.firstChild){ dataContainer.removeChild(dataContainer.firstChild); } }

  /*resetCounters to 0 after every game*/
  function resetCounters(){ nrOfGuesses = 0; nrOfGuessesLow = 0; nrOfGuessesHigh = 0; }

  /*output a custom console.log msg if true (set flag to true on line 20) */
  function outputConsoleMsg(text){ if( error_msg_flag ){ console.log(text); }  }
};
