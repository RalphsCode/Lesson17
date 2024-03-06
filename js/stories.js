"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let userFavoritesArr;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  userFavoritesArr = await getFavorites();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}


// Event Listener for the add story button
$('#submit-post').on('click', function(evt){
  evt.preventDefault();
  const author = $("#submit-author").val();
  const title = $("#submit-title").val();
  const url = $("#submit-url").val();
  storyList.addStory(currentUser, {title, author, url});
  // Reset the form fields
  $("#submit-author").val('');
  $("#submit-title").val('');
  $("#submit-url").val('');
  })

  
/** get the user favorites array with an API call */
async function getFavorites(){
  if (currentUser !== undefined){
   const urlString = `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}?token=${currentUser.loginToken}`;
        // get the favorites array of the user with an API get request
        const response = await axios({
              url: urlString,
              header: 'Content-Type: application/json',
              method: 'GET' }
        );
        console.log('user favorites array length: ', response.data.user.favorites.length);
        userFavoritesArr = response.data.user.favorites;
        return userFavoritesArr;
      }
    }

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

//  

  // create the HTML markup, and call function to check which favorite star icon to use
  return $(`
      <li id="${story.storyId}">  
        ${favIcon(story)}&nbsp;
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>&nbsp;
        <i class="fa-solid fa-xmark" style="color: lightcoral;" title="Delete story" id="story-delete"></i>&nbsp;
        <small class="story-hostname">(${hostName})</small><br>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user"">posted by ${story.username}</small>
        <hr>
      </li>
    `);
}


/** Show solid star if story is in users favorite story Array
    or, show star outline if story is not a favorite of the user */

function favIcon(story){  
      if (currentUser !== undefined){
          // Check for the user having no favorites
          if (userFavoritesArr !== undefined) {
            if (userFavoritesArr.length >= 1){
              // See if the current story is in the user's favorites array
              const foundFavorite = userFavoritesArr.find(favStory => favStory.storyId === story.storyId);
                    if (foundFavorite){
                      // If the story is a favorite add 'favorite' to the class, and use the solid star icon
                  return '<i class="fa-sharp fa-solid fa-star favorite" style="color: green;" id="favorite"></i>';
                } else {
                      // If the story is not a favorite, show the outline star icon
                  return '<i class="fas fa-sharp fa-regular fa-star" title="Tag as a favorite" id="favorite"></i>';
                }
            } else {  
              // If the user has no favorites, show the outline star icon
              return '<i class="fas fa-sharp fa-regular fa-star" title="Tag as a favorite" id="favorite"></i>';
              } // END for...of loop
          } else {
            return '<i class="fas fa-sharp fa-regular fa-star"  title="Tag as a favorite" ></i>';
          }
      } else {
        return '<i class="fas fa-sharp fa-regular fa-star" title="Log in to tag as a favorite" ></i>';
      }
    }  // END favIcon()
  

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage(evt) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

/** generate the array of the requested stories
 * ( (a) all stories, (b) favorites, (c) my stories)  */
  if (evt != undefined){    // exclude fresh page load which doesn't have an event
      const whichStories = evt.target.id;   // get the type of stories requested
      if (whichStories == 'nav-favorites') {  // user requested favorite stories
        if (currentUser !== undefined){
          if (userFavoritesArr == undefined || userFavoritesArr.length == 0){   // if ther are no favorite stories
                const noFavoriteText = '<p>You have not tagged any stories as favorite stories.</p>';
                $allStoriesList.append(noFavoriteText);
          } else {
          // loop through all favorite stories and generate HTML for them
          const onlyFavoritesObj = onlyFavorites();
          for (let story of onlyFavoritesObj) {
            const $story = generateStoryMarkup(story);
            $allStoriesList.append($story);
              }}
        } else {
              notLoggedIn();
            }

      } else {
      // loop through all stories and generate HTML for them
      for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
  }
}
} else {
      // loop through all stories and generate HTML for them
      for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
      }
  }
 
  $allStoriesList.show();
}

// function to get only the stories from storyList that are also user favorites

function onlyFavorites() {
  // Create an object containing only favorite story IDs
  const favoriteStoryIds = {};
  userFavoritesArr.forEach(story => favoriteStoryIds[story.storyId] = true);

  // Use filter() to pull out of storyList the User favorites
  // only return the storyId's that have a match in the new favoriteStoryId's object
  return storyList.stories.filter(story => favoriteStoryIds[story.storyId]);
} // END onlyFavorites()


  /** Delete a story from the database */

async function deleteStory(storyId) {
    // Immediately Invoked Function Expression (IIFE) to confirm the story deletion
      const confirmDelete = confirm("Delete this story?");
      if (confirmDelete) {
        console.log("User clicked OK - deleting story");
            // Send an API DELETE request
            const response = await axios({
                  header: 'Content-Type: application/json',
                  method: 'DELETE',
                  url: `${BASE_URL}/stories/${storyId}`,
                  data: {"token": currentUser.loginToken, 
                  } } ); 
                // Load the 'home' page
                getAndShowStoriesOnStart();
                return new Story({response}); 
      } else {
        console.log("User clicked Cancel delete");
      }
}; // END deleteStory();