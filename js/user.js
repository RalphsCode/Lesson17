"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

// grab the DOM element containing the stories
const $tagFavoriteStory = $("#all-stories-list");


/**  Add an event listener (JQuery) to the parent DOM element (delegation).
     Create an onOff variable to track if the story is a favorite or not  */

    $tagFavoriteStory.on('click', '#favorite', function(evt){
      // element id contains the storyId pertaining to the clicked favorite star icon
      const element = evt.target;
      let onOff = false;    // story is NOT a favorite
        if (element.classList.contains("favorite")){
          onOff = true;     // story IS a favorite
        };
      //  call function to assign/de-assign a story as a favorite
      processFavoriteStory(element.parentElement.id, onOff);
    })

    /**  Add an event listener (JQuery) to the parent DOM element (delegation).
         Processes a click on the X - Delete icon */

     $tagFavoriteStory.on('click', '#story-delete', function(evt){
      //  call function to delete the relevant story
      deleteStory(evt.target.parentElement.id);
    })



  /** Function to assign or de-assign a story as a favorite   */

  async function processFavoriteStory(storyId, onOff){
    // Ternary Operator to decide whether the API should POST or DELETE
    const APImethod = onOff === true ? 'DELETE' : 'POST';
    const urlString = `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${storyId}?token=${currentUser.loginToken}`;
    // API call to assign (POST) or de-assign (DELETE) the story as a favorite    
    const response = await axios({
      url: urlString,
      header: 'Content-Type: application/json',
      method: APImethod }
    );
    console.log('response from processFavorite API call: ', response);
  // Reload the main page  
  getAndShowStoriesOnStart();
  }


/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();
  $allStoriesList.show();

  updateNavOnLogin();
}

