var app = angular.module('messageApp', ['ui.bootstrap']);

app.controller('mainController', function($scope, $timeout, $http) {

  $scope.newResp = "";
  $scope.sendInput = "";
  $scope.scheduleInput = "";
  $scope.messages = null;
  $scope.schedule = null;
  $scope.groupme = null;
  $scope.popup = false;
  $scope.date = new Date();
  $scope.regexes = [];
  $scope.curExp = {};

  var timer;

  function getData() {
    timer = $timeout(function() {
      console.log("Timeout executed", Date.now());
    }, 10000);

    timer.then(function() {
      console.log("Timer resolved!");

      $scope.getGroupme();
      $scope.getSchedule();
      $scope.getRegexes();
      scrollToBottom();
      var now = new Date();
      if ($scope.date < now) {
        $scope.date = now;
      }
      getData();

    }, function() {
      console.log("Timer rejected!");
    });
  }
  getData();

  function scrollToBottom() {
    var elem = document.getElementById('chat');
    console.log(elem);
    elem.scrollTop = elem.scrollHeight;
  }


  /** Date and Time **/
  $scope.openPopup = function() {
    $scope.popup = true;
  };

  $scope.today = function() {
    $scope.datet = new Date();
  };
  //$scope.today();

  $scope.setCurrentExp = function(regex) {
    $scope.curExp = regex;
  };

  /** API Interface **/


  /* GroupMe Conversation */

  $scope.getGroupme = function() {
    $http.get('api/groupme')
      .success(function(data) {
        $scope.groupme = data.messages;
        console.log(data);
        scrollToBottom();
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
  $scope.getGroupme();

  $scope.sendGroupme = function(text) {
    //send message
    item = {};
    item.text = text;
    $http.post('/api/groupme', item)
      .success(function(data) {
        $scope.sendInput = '';
        $scope.groupme = data.messages;
        scrollToBottom();
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };


  /* Scheduled Messages */

  $scope.getSchedule = function() {
    $http.get('api/schedules')
      .success(function(data) {
        $scope.schedule = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
  $scope.getSchedule();

  $scope.createSchedule = function() {
    item = {};

    item.message = $scope.scheduleInput;
    item.when = $scope.date;

    $http.post('/api/schedules', item)
      .success(function(data) {
        $scope.scheduleInput = '';
        $scope.schedule = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  $scope.deleteSchedule = function(id) {
    $http.delete('/api/schedules/' + id)
      .success(function(data) {
        $scope.schedule = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };


  /* Regexes and responses */

  $scope.getRegexes = function() {
    $http.get('/api/expressions')
      .success(function(data) {
        $scope.regexes = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
  $scope.getRegexes();

  $scope.newRegex = function() {
    if ($scope.newExp === '') {
      return;
    }
    var item = {};
    item.exp = $scope.newExp;
    item._id = null;
    $http.post('/api/expressions', item)
      .success(function(data) {
        $scope.regexes = data;
        $scope.newExp = null;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  $scope.updateRegex = function() {
    $http.post('/api/expressions', $scope.curExp)
      .success(function(data) {
        $scope.regexes = data;
        $scope.newExp = null;
        $scope.newResp = null;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  $scope.addResponse = function() {
    if ($scope.newResp === '') {
      return;
    }
    if ($scope.curExp.responses.push($scope.newResp)) {
      $scope.updateRegex();
    }
  };

  $scope.deleteResponse = function(resp) {
    var index = $scope.curExp.responses.indexOf(resp);
    if ($scope.curExp.responses.splice(index, 1)) {
      $scope.updateRegex();
    }
  };

  $scope.deleteRegex = function() {
    $http.delete('/api/expressions/' + $scope.curExp._id)
      .success(function(data) {
        $scope.regexes = data;
        $scope.curExp = data[0];
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // $scope.$on("$destroy", function(event) {
  //   $timeout.cancel(timer);
  // });

});
app.filter('reverse', function() {
  return function(items) {
    if (items === null) return null;
    return items.slice().reverse();
  };
});
