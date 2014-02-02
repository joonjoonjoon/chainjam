/*
 * Contains the list of available games
 */
 var _g = new Array();
 var _games;
 var _gamesCounter = -1;
 
 // game No 1
 _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Joon's Game"; // name of the game
 _g[_gamesCounter].path = "demogame2.unity3d"; // path to the game within the games directory
 _g[_gamesCounter].type = "unity"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "Joon";
 _g[_gamesCounter].instructions = "Press up to jump. Jump on the others to score points.";
 
 // game No 2
 _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Joon's Game"; // name of the game
 _g[_gamesCounter].path = "demogame.unity3d"; // path to the game within the games directory
 _g[_gamesCounter].type = "unity"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "Joon";
 _g[_gamesCounter].instructions = "Press up to jump. Jump on the others to score points.";

// game No 3
 _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Anders's Flash Game"; // name of the game
 _g[_gamesCounter].path = "demogame.unity3d"; // path to the game within the games directory
 _g[_gamesCounter].type = "flash"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "Anders";
 
 // game no 4
  _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Sam's HTML5 Game"; // name of the game
 _g[_gamesCounter].path = "demogame.unity3d"; // path to the game within the games directory
 _g[_gamesCounter].type = "html5"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "Sam";
 
 // game no 5
  _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Crazy Person's Java Game"; // name of the game
 _g[_gamesCounter].path = "demogame.unity3d"; // path to the game within the games directory
 _g[_gamesCounter].type = "java"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "C.P.";
 
  // game no 6
  _gamesCounter++;
 _g[_gamesCounter] = new Object();
 _g[_gamesCounter].name = "Flash Focus Test"; // name of the game
 _g[_gamesCounter].path = "game5/inputtest.swf"; // path to the game within the games directory
 _g[_gamesCounter].type = "flash"; // type: unity / flash / html / java
 _g[_gamesCounter].credits = "Joon";