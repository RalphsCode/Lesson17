"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage(evt);
}

$body.on("click", "#nav-all", navAllStories);

/** Show 'Submit Post' form on click on "submit" */
function submitStory(evt) {
  console.debug("submitStory", evt);
  if (currentUser !== undefined){
    // A user IS logged in
    hidePageComponents();
    $submitForm.show();
  } else {
    // No user logged in
    $allStoriesList.empty();
    const notLoggedInText = '<p>You have to be logged in to access this feature.</p>';
    $allStoriesList.append(notLoggedInText);
    $allStoriesList.show();
  }
}

$body.on("click", "#nav-submit", submitStory);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

$body.on("click", "#nav-favorites", navAllStories);