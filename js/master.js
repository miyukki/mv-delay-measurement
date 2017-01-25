/* */
var recordedMills = null;

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var inputSource = {};
inputSource.video = function(url) {
  return {
    type: "video",
    url: url
  };
};

inputSource.image = function(url) {
  return {
    type: "image",
    url: url
  };
};

inputSource.color = function(r, g, b) {
  return {
    type: "color",
    color: "rgb(" + r + ", " + g + ", " + b + ")"
  };
};

angular.module('application', [])
  .controller('ProgramController', function($scope, $element) {
    $scope.$parent.program = $scope;

    var canvas = $element.find('canvas')[0];
    var ctx = canvas.getContext('2d');

    var drawToCanvas = function() {
      if ($scope.source != null) {
        if ($scope.source.source.type == 'video') {
          ctx.drawImage($scope.source.video, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage($scope.sourceCanvas, 0, 0, canvas.width, canvas.height);
        }
        if (recordedMills != null) {
          if ($scope.$parent.currentStep != -1) {
            var actualDelay = (new Date().getTime() - recordedMills);
            var log = {
              eventTime: recordedMills,
              source: $scope.source.sourceNumber,
              switchDelay: $scope.$parent.switchDelay,
              actualDelay: actualDelay
            };
            $scope.$parent.logs.push(log);
            // console.log(log);
          }
          recordedMills = null;
        }
      }
      window.requestAnimationFrame(drawToCanvas);
    };
    drawToCanvas();
  })
  .controller('SourceController', function($scope, $element) {
    $scope.sourceNumber = $scope.$parent.children.length;
    $scope.$parent.children.push($scope);
    $scope.source = $scope.$parent.sources[$scope.sourceNumber];

    var canvas = $element.find('canvas')[0];
    var ctx = canvas.getContext('2d');
    $scope.canvas = canvas;

    switch ($scope.source.type) {
      case 'video':
        var video = document.createElement('video');
        $element.append(video);
        video.src = $scope.source.url;
        video.autoplay = true;
        video.loop = true;
        video.volume = 0;
        video.play();
        var drawToCanvas = function() {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          window.requestAnimationFrame(drawToCanvas);
        };
        video.addEventListener('play', drawToCanvas, false);
        $scope.video = video;
        break;

      case 'image':
        var img = new Image();
        img.src = $scope.source.url;
        img.onload = function() {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        break;

      case 'color':
        ctx.fillStyle = $scope.source.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;

      default:
        break;
    }

    // Fire onReady event when created all sources
    if ($scope.$parent.children.length == $scope.$parent.sources.length) {
      $scope.$parent.onReady();
    }
  })
  .controller('MultiviewController', function($scope, $document) {
    $scope.children = [];
    $scope.programSourceIndex = 0;
    $scope.switchDelay = 0;
    $scope.logs = [];
    $scope.results = [];
    $scope.currentStep = -1;
    $scope.remainSecond = 0;
    $scope.steps = shuffle([0, 33.33, 66.66, 99.99, 133.33, 166.66, 199.99, 233.33, 266.66, 299.99, 333.33, 366.66, 399.99, 433.33, 466.66, 499.99]);
    // $scope.steps = shuffle([0, 33.33, 66.66, 99.99, 133.33, 166.66, 199.99, 233.33, 266.66, 299.99]);
    $scope.sources = [
      // inputSource.video('img/sample_video_1.mp4'),
      inputSource.image('img/sample_image_1.png'),
      inputSource.image('img/sample_image_2.png'),
      inputSource.image('img/sample_image_3.png'),
      inputSource.image('img/sample_image_4.png'),
      inputSource.image('img/sample_image_5.png'),
      inputSource.image('img/sample_image_6.png'),
      inputSource.image('img/sample_image_7.png'),
      inputSource.image('img/smpte_colorbar.png'),
      // inputSource.image('img/smpte_colorbar.png')
      // inputSource.video('img/sample_video_1.mp4'),
      // inputSource.image('img/smpte-colorbar.png'),
      // inputSource.video('img/sample_video_2.mp4'),
      // inputSource.image('img/smpte-colorbar.png'),
      // inputSource.color(255, 255, 0),
      // inputSource.color(255, 0, 255),
      // inputSource.color(0, 255, 255)
    ];
    $scope.isSmartPhone = function() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/windows phone/i.test(userAgent)) {
          return true;
      }

      if (/android/i.test(userAgent)) {
          return true;
      }

      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
          return true;
      }

      return false;
    };
    $scope.changeProgramDisplay = function() {
      $scope.program.source = $scope.children[$scope.programSourceIndex];
      $scope.program.sourceCanvas = $scope.children[$scope.programSourceIndex].canvas;
    };
    $scope.onReady = function() {
      $scope.changeProgramDisplay();
    };
    $scope.getResultText = function() {
      var d = [];
      for (var i in $scope.results) {
        if ($scope.results[i].feel == 1) {
          d.push("遅延 " + $scope.results[i].switchDelay + "ms のとき、遅延を許容できる");
        } else {
          d.push("遅延 " + $scope.results[i].switchDelay + "ms のとき、遅延を許容できない");
        }
      }
      return d.join("\n");
    }
    $scope.recordFeel = function(feel) {
      var result = {
        switchDelay: $scope.switchDelay,
        feel: feel
      };
      $scope.results.push(result);

      if ($scope.results.length == $scope.steps.length) {
        $scope.currentStep++;
        $scope.sendStats();
      }
    };
    $scope.finishStep = function() {
      $scope.remainSecond = 0;
    }
    $scope.nextStep = function() {
      $scope.remainSecond = 18;
      $scope.currentStep = $scope.currentStep + 1;
      $scope.switchDelay = $scope.steps[$scope.currentStep];
      $scope.programSourceIndex = 0;
      $scope.changeProgramDisplay();

      var intervalId = setInterval(function() {
        if ($scope.remainSecond > 0) {
          $scope.remainSecond--;
          $scope.$apply();
        }
        if ($scope.remainSecond <= 0) {
          clearInterval(intervalId);
        }
      }, 1000);
    };
    $scope.sendStats = function() {
      var config = {
        apiKey: "AIzaSyD-kCdM812V6qrVqGHgWNh243tdvLdh1_E",
        authDomain: "mv-delay-mesurement.firebaseapp.com",
        databaseURL: "https://mv-delay-mesurement.firebaseio.com",
        storageBucket: "mv-delay-mesurement.appspot.com",
        messagingSenderId: "890325040369"
      };
      firebase.initializeApp(config);
      var data = { time: new Date().getTime(), results: $scope.results, logs: $scope.logs };
      var newRef = firebase.database().ref('stats2').push(data, function(err) {
        if (err) {
          alert("データを自動的に送信できませんでした");
          prompt("次の値をコピーして、フォームに貼り付けて送信して下さい", JSON.stringify(data));
          open("https://docs.google.com/forms/d/e/1FAIpQLSeLyIiewsoVLy0FN4GUQ1xkQer05HM9QvvATxbBy8hyK2pXjg/viewform");
        }
      });
    };

    var handleKeydown = function(e) {
      if (49 <= e.keyCode && e.keyCode <= 56) {
        recordedMills = new Date().getTime();
        $scope.programSourceIndex = e.keyCode - 49;
        $scope.changeProgramDisplay();
        $scope.$apply();
      }
      if (97 <= e.keyCode && e.keyCode <= 104) {
        recordedMills = new Date().getTime();
        $scope.programSourceIndex = e.keyCode - 97;
        $scope.changeProgramDisplay();
        $scope.$apply();
      }
    };

    document.addEventListener('keydown', function(e) {
      if (!(e.keyCode >= 49 && e.keyCode <= 56) && !(e.keyCode >= 97 && e.keyCode <= 104)) {
        return;
      }
      if ($scope.currentStep != -1 && ($scope.remainSecond <= 0 || 15 < $scope.remainSecond)) {
        return;
      }

      if ($scope.switchDelay === 0) {
        handleKeydown(e);
      } else {
        setTimeout(function() {
          handleKeydown(e);
        }, $scope.switchDelay);
      }
    });
  });
