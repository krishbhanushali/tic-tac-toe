
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyBKKvIWPS_gSA1WL_sxwkeuyUWqSeZotuU",
    authDomain: "tictactoe-44563.firebaseapp.com",
    databaseURL: "https://tictactoe-44563.firebaseio.com",
    projectId: "tictactoe-44563",
    storageBucket: "tictactoe-44563.appspot.com",
    messagingSenderId: "858746073970"
  };
  firebase.initializeApp(config);
angular.module('gameApp', ['ngRoute', 'firebase'])
    .config(function($routeProvider){
        $routeProvider
            .when('/', {
                controller:'MainController',
                templateUrl: 'partials/main.html'                
            })
            .when('/game/:id/:player', {
                controller: 'GameController as game',
                templateUrl: 'partials/game.html'
            })
            .when('/games', {
                controller: 'MainController',
                templateUrl: 'partials/games.html'
            })
            .otherwise({
                redirectTo: '/'
            })
    })
    .controller('GameController', ['$routeParams','$location','$scope','$interpolate','$firebaseObject',function($routeParams, $location,$scope,$interpolate,$firebaseObject){
        this.player = $routeParams.player
        this.id = $routeParams.id
        
        // Error Checking
        

        // Fetch our game from Firebase
        $scope.board = {};
        $scope.game = firebase.database().ref("games").child("game"+this.id);
        $scope.player = $routeParams.player;
        //sync for winner
        let winnerRef = firebase.database().ref("games/game"+this.id).child("winner");
        let syncObject = $firebaseObject(winnerRef);
        syncObject.$bindTo($scope,"winner");

        //sync for turn
        /*let turnRef = firebase.database().ref("games").child("game"+this.id+"/turn");
        let syncObjectForTurn = $firebaseObject(turnRef);
        syncObjectForTurn.$bindTo($scope,"turn");*/
        
        let ref = firebase.database().ref("games").child("game"+this.id+"/turn");
        $scope.turn = $firebaseObject(ref);
        // Displaying your board
        $scope.game.on("value",snapshot=>{
            $scope.board = snapshot.val().board;
            if($scope.board.zerozero!="" && $scope.board.zeroone!="" && $scope.board.zerotwo!="" &&
                $scope.board.onezero!="" && $scope.board.oneone!="" && $scope.board.onetwo!="" &&
                $scope.board.twozero!="" && $scope.board.twoone!="" && $scope.board.twotwo!=""){
                winnerRef.set('draw');
            }
            $scope.$evalAsync();
        });

        $scope.game.on("child_changed",snap=>{
            $scope.board = snap.val();

            if($scope.board.zerozero=="X" && $scope.board.zeroone=="X" && $scope.board.zerotwo=="X" ||
                $scope.board.onezero=="X" && $scope.board.oneone=="X" && $scope.board.onetwo=="X" ||
                $scope.board.twozero=="X" && $scope.board.twoone=="X" && $scope.board.twotwo=="X"){
                winnerRef.set('X');
            }
            if($scope.board.zerozero=="X" && $scope.board.onezero=="X" && $scope.board.twozero=="X" ||
                $scope.board.zeroone=="X" && $scope.board.oneone=="X" && $scope.board.twoone=="X" ||
                $scope.board.zerotwo=="X" && $scope.board.onetwo=="X" && $scope.board.twotwo=="X"){
                winnerRef.set('X');
            }
            if($scope.board.zerozero=="X" && $scope.board.oneone=="X" && $scope.board.twotwo=="X" ||
                $scope.board.zerotwo=="X" && $scope.board.oneone=="X" && $scope.board.twozero=="X"){
                winnerRef.set('X');
            }

            if($scope.board.zerozero=="O" && $scope.board.zeroone=="O" && $scope.board.zerotwo=="O" ||
                $scope.board.onezero=="O" && $scope.board.oneone=="O" && $scope.board.onetwo=="O" ||
                $scope.board.twozero=="O" && $scope.board.twoone=="O" && $scope.board.twotwo=="O"){
                winnerRef.set('O');
            }
            if($scope.board.zerozero=="O" && $scope.board.onezero=="O" && $scope.board.twozero=="O" ||
                $scope.board.zeroone=="O" && $scope.board.oneone=="O" && $scope.board.twoone=="O" ||
                $scope.board.zerotwo=="O" && $scope.board.onetwo=="O" && $scope.board.twotwo=="O"){
                winnerRef.set('O');
            }
            if($scope.board.zerozero=="O" && $scope.board.oneone=="O" && $scope.board.twotwo=="O" ||
                $scope.board.zerotwo=="O" && $scope.board.oneone=="O" && $scope.board.twozero=="O"){
                winnerRef.set('O');
            }

        })

        // Displaythe current state of the game
        //  - Who's turn is it
        //  - Who is the winner? Draw?
        
        $scope.boxClicked = function(x,y){
            let boardRef = firebase.database().ref("games/game"+$scope.game.id+"/board");
            let turnRef = firebase.database().ref("games/game"+$scope.game.id+"/turn");
            
            $scope.turnRef = firebase.database().ref("games/game"+$scope.game.id+"/turn");
            $scope.turnRef.on("value",snapshot=>{
                    $scope.turnRef = snapshot.val();
            });
            

            if($scope.turnRef=="X" && $routeParams.player=="X"){
                boardRef.child(''+x+y).set(''+$scope.turnRef);
                turnRef.set('O');
            }
            if($scope.turnRef=="O" && $routeParams.player=="O"){
                boardRef.child(''+x+y).set(''+$scope.turnRef);
                turnRef.set('X');
            }
        }
        $scope.redirectToHome = function(){
            $location.path("/");
        }
    }])
    .controller('MainController',['$scope', '$firebaseAuth', '$firebaseArray','$firebaseObject','$interpolate','$location',function ($scope, $firebaseAuth,$firebaseArray,$firebaseObject,$interpolate,$location){
        let auth = $firebaseAuth()
        let gamesRef = firebase.database().ref("games");

        let syncObject = $firebaseObject(gamesRef);
        syncObject.$bindTo($scope,"games");
        $scope.createGame = function(){
            $scope.allGames = $firebaseArray(gamesRef);
            $scope.player = 'X';
            let rand = Math.floor(Math.random()*50000)+1;
            var game = {id:rand,turn:$scope.player,player1:$scope.player,player2:"",board:{zerozero:'',zeroone:'',zerotwo:'',onezero:'',oneone:'',onetwo:'',twozero:'',twoone:'',twotwo:''},winner:''};

            var newGameRef = gamesRef.child('game'+rand).set(game);
            $scope.id = rand;
            let url = $interpolate('/game/{{id}}/{{player}}')($scope);
            $location.path(url);
        }

        $scope.showExistingGames = function(){
            $location.path('/games');
        }

        $scope.goToExistingGame = function(gameId,player){
            $scope.player1Ref = firebase.database().ref("games/game"+gameId+"/player1");
            $scope.player2Ref = firebase.database().ref("games/game"+gameId+"/player2");
            $scope.player1Ref.on("value",snapshot=>{
                    $scope.player1Ref = snapshot.val();
            });
            let player2 = "";
            if($scope.player1Ref=="X"){
                $scope.player2Ref.set("O");
                player2="O";
            }
            else if($scope.player1Ref=="O"){
                $scope.player2Ref.set("X");
                player2="X";
            }
            $location.path('/game/'+gameId+'/'+player2);
        }
    }])

    