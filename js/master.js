angular.module('application', [])
  .controller('MultiviewController', function($scope, $document) {
    var srcVideo = function(url) {

    };

    var srcImage = function(url) {

    };

    var srcColor = function(r, g, b) {

    };

    $scope.programCameraIndex = 1;

    $scope.inputMappings = [
      srcVideo(),
      srcVideo(),
      srcImage('img/smpte-colorbar.bmp'),
      srcImage(),
      srcColor('#yellow'),
      srcColor(),
      srcColor(),
      srcColor()
    ];

    $scope.handleKeydown = function(e) {
      switch (e.keyCode) {
        case 49:
          $scope.programCameraIndex = 1;
          break;
        case 50:
          $scope.programCameraIndex = 2;
          break;
        case 51:
          $scope.programCameraIndex = 3;
          break;
        case 52:
          $scope.programCameraIndex = 4;
          break;
        case 53:
          $scope.programCameraIndex = 5;
          break;
        case 54:
          $scope.programCameraIndex = 6;
          break;
        case 55:
          $scope.programCameraIndex = 7;
          break;
        case 56:
          $scope.programCameraIndex = 8;
          break;
        default:
          // NOP
          break;
      }
    };
  });
