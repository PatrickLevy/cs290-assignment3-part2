//********************************************************************************
//Name:               Patrick Levy
//Course:             CS290 
//Assignment:         Assigment3 - Part 2 - Adding Ajax and HTML
//Description:        This website will utilize an ajax call to pull a page of 
//                    gists from github. Specific results will be able to be saved
//                    as favorites and stored in localstorage.
//Code Citation:      The code that performs the ajax call was modeled closely after
//                    code provided by the instructors of the CS290 course in the video
//                    titled "Ajax" that demonstrates the use of the OpenWeathermap API
//*********************************************************************************    

// Declare variables 
var savedFavoriteGists = {'gists':[]};
var gistList = {'gists':[]};

// gist object declaration
function gists(gDescription, gUrl, gId){
  if(gDescription === null || gDescription.length === 0){
    this.gDescription = 'No description given';
  }
  else{
  this.gDescription = gDescription;
  }
  this.gUrl = gUrl;
  this.gId = gId;
  this.gFavorite = false;
}
//*************************************************************
// Function to add gists to favorites and save to local storage
//*************************************************************
function addToFavorites(){
  for (var i=0; (i < document.getElementById('gist-list').childNodes.length); i++){
    if (document.getElementById('checkbox'+i)){
      if (document.getElementById('checkbox'+i).checked === true) {
        var gistDesc = gistList.gists[i].gDescription;
        var gistUrl = gistList.gists[i].gUrl;
        var gistId = gistList.gists[i].gId;
        var gistEntry = new gists(gistDesc, gistUrl, gistId);
        savedFavoriteGists.gists.push(gistEntry);
        gistList.gists[i].gFavorite = true;
      }
    }
  }
  //Re-render lists of gists on page
  createFavoritesList();
  createGistList();
  localStorage.setItem('savedGists', JSON.stringify(savedFavoriteGists));
}
//*************************************************************
// Function to create list of gists on page
//*************************************************************
function createGistList(){
  var ul = document.getElementById('gist-list')
  var favoriteGist = false;
  
  //Remove old list from page
  for (var i=ul.childNodes.length-1; i >= 0; i--) {
    ul.removeChild(ul.childNodes[i]);
  }  
  
  //Create new list on page
  for (var i=0; i < gistList.gists.length; i++){
    favoriteGist = false;
    
    //Check if the id matches any of the id's in the favorites list
    for (var j=0; j < savedFavoriteGists.gists.length; j++){
      if (savedFavoriteGists.gists[j].gId === gistList.gists[i].gId){
        favoriteGist = true;
      }
    }
      if (favoriteGist === false){
      
      //Create a list item for each search result
      var item = document.createElement('li');
      item.style = 'list-style-type:none';
      ul.appendChild(item);

      //Create a checkbox for each item
      var checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.id = ('checkbox'+i);
      checkBox.checked = false;
      ul.appendChild(checkBox);

      //Create a link for each result
      var node = document.createElement('a');
      var nodeText = document.createTextNode(gistList.gists[i].gDescription);
      node.appendChild(nodeText);
      node.title = gistList.gists[i].gDescription;
      node.href = gistList.gists[i].gUrl;
      ul.appendChild(node);
    }
  }
}
//*************************************************************
// Function to create a list of the favorited gists on the page
//*************************************************************
function createFavoritesList(){
  var ul = document.getElementById('gist-favorites')

  //Remove old list
  for (var i=ul.childNodes.length-1; i >= 0; i--) {
    ul.removeChild(ul.childNodes[i]);
  }
  
  //Create new list on page
  for (var i=0; i < savedFavoriteGists.gists.length && savedFavoriteGists.gists[0] !== null; i++){

    //Create a list item for each search result
    var item = document.createElement('li');
    item.style = 'list-style-type:none';
    ul.appendChild(item);

    //Create a remove button for each item
    var removeFav = document.createElement('input');
    removeFav.type = 'button';
    removeFav.id = ('removeFavBtn'+i);
    removeFav.value = ('Delete');
    
    removeFav.onclick = function(){
      var removeIndex = this.id;
      removeIndex = removeIndex.substring(12, removeIndex.length);
      //console.log('removeIndex: ' + removeIndex);
      var removeId = savedFavoriteGists.gists[removeIndex].gId;
      //console.log('Remove id:' + removeId);
      removeFavorites(removeId);
      };
    ul.appendChild(removeFav);

    //Create a link for each result
    var node = document.createElement('a');
    var nodeText = document.createTextNode(savedFavoriteGists.gists[i].gDescription);
    node.appendChild(nodeText);
    node.title = savedFavoriteGists.gists[i].gDescription;
    node.href = savedFavoriteGists.gists[i].gUrl;
    ul.appendChild(node);
  }
}
//*************************************************************
// Function to remove favorites upon user selection of delete button
//*************************************************************
function removeFavorites(id){
  //remove item from favorites list
  for (var i = 0; i < savedFavoriteGists.gists.length; i++){
    if (savedFavoriteGists.gists[i].gId === id){
      savedFavoriteGists.gists.splice(i, 1);
      localStorage.setItem('savedGists', JSON.stringify(savedFavoriteGists));
    }
  }
  //create updated list of gists
  createGistList();
  
  //create updated list of favorite gists
  createFavoritesList();
}

//*************************************************************
// Function to get list of gists using Ajax
//*************************************************************
function getGists(){
  console.log("running getGists()")
  //Delete old gists, if present
  if (gistList.gists.length !== 0){
    gistList.gists = [];
  }

  var req = new XMLHttpRequest();
  if(!req){
    throw 'Unable to create HttpRequest.';
  }
  var url = 'http://api.github.com/gists';
  var params = {
    page: '1'
  };
  url += '?' + urlStringify(params);
  
  //Ajax call
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var ajaxGistList = JSON.parse(this.responseText);
      
      //Create list of gists with only required information
      for (var i = 0; i < ajaxGistList.length; i++){
        var gistDesc = ajaxGistList[i].description;
        var gistUrl = ajaxGistList[i].html_url;
        var gistId = ajaxGistList[i].id;
        var gistEntry = new gists(gistDesc, gistUrl, gistId);
        gistList.gists.push(gistEntry);
      }
      //Re-render list of gists
      createGistList();
    }
  };
  req.open('GET', url);
  req.send();
}

//*************************************************************
// Function to stringify the url for the ajax call
//*************************************************************
function urlStringify(obj){
  var str = []
  for(var prop in obj){
    var s = encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]);
    str.push(s);
  }
  return str.join('&');
}

//*************************************************************
//Function to load saved gists upon page load
//*************************************************************
window.onload = function() {
  var favoriteGistsStr = localStorage.getItem('savedGists');
  if( favoriteGistsStr === null ) {
    savedFavoriteGists = {'gists':[]};
    localStorage.setItem('savedGists', JSON.stringify(savedFavoriteGists));
  }
  else {
    savedFavoriteGists = JSON.parse(localStorage.getItem('savedGists'));
  }
  createFavoritesList();
};


