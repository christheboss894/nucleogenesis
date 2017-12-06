'use strict';

angular
  .module('game')
  .controller('main-loop', ['$scope',
    '$interval',
    '$timeout',
    'savegame',
    'state',
    function($scope, $interval, $timeout, savegame, state) {
      $scope.state = state;

      let self = this;
      let playerCopy = null;

      self.update = function() {
        // do the update in a copy
        playerCopy = angular.copy(state.player);

        state.update(playerCopy);

        // and update all at once
        state.player = playerCopy;
      };

      self.updateLoop = function() {
        self.update();
        $timeout(self.updateLoop, 1000);
      };

      self.processOffline = function() {
        let remaining = state.offlineCyclesTotal-state.offlineCyclesCurrent;
        let cycles = Math.min(32, remaining);

        for(let i = 0; i < cycles; i++){
          self.update();
          state.offlineCyclesCurrent++;
          remaining--;
        }

        if(remaining > 0 && !state.cancelOffline){
          $timeout(self.processOffline);
        }else{
          // we are done processing, turn off the screens
          state.processingOffline = false;
          state.loading = false;
          // trigger the game loop
          $timeout(self.updateLoop, 1000);
          $interval(savegame.save, 10000);
        }
      };

      self.startup = function() {
        savegame.load();
        let elapsed = Math.floor(Date.now()/1000)-state.player.last_login;
        // lets limit the offline elapsed time
        elapsed = Math.min(3600, elapsed);
        state.offlineCyclesTotal = elapsed;
        state.offlineCyclesCurrent = 0;
        if(elapsed > 32){
          state.loading = false;
          state.processingOffline = true;
        }
        $timeout(self.processOffline);
      };

      $timeout(self.startup);
    }
  ]);
