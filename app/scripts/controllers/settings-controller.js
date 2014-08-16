'use strict';

var sc = angular.module('stellarClient');

sc.controller('SettingsCtrl', function($scope, $http, $q, $timeout, $state, session, singletonPromise, rewards) {
  var wallet = session.get('wallet');

  $scope.secretKey = wallet.keychainData.signingKeys.secret;

  $scope.getEmailState = function () {
    return $scope.emailState;
  }

  $scope.setEmailState = function (state) {
    $scope.emailState = state;
  }

  $scope.resetEmailState = function () {
    if ($scope.email) {
      $scope.emailState = 'added';
    } else {
      $scope.emailState = 'none';
    }
  }

  $scope.emailAction = singletonPromise(function () {
    if ($scope.emailState == 'add') {
      return $scope.addEmail();
    } else if ($scope.emailState == 'change') {
      return $scope.changeEmail();
    } else if ($scope.emailState == 'verify') {
      return $scope.verifyEmail();
    } else {
      return;
    }
  });

  $scope.verifyEmail = singletonPromise(function () {
    // newEmail is the model for the input element they're entering their code into
    return verifyEmail($scope.newEmail)
      .then(rewards.claimEmail())
      .then(function () {
        $scope.refreshAndInitialize();
      })
  });

  $scope.addEmail = singletonPromise(function () {
    return addEmail($scope.newEmail)
      .then(function () {
        $scope.refreshAndInitialize();
      })
  });

  $scope.changeEmail = singletonPromise(function () {
    return changeEmail($scope.newEmail)
      .then(function () {
        $scope.refreshAndInitialize();
      })
  });

  function verifyEmail (code) {
    var data = {
      username: session.get('username'),
      updateToken: session.get('wallet').keychainData.updateToken,
      recoveryCode: code
    }
    return $http.post(Options.API_SERVER + "/user/verifyEmail", data);
  }

  function addEmail (email) {
    var data = {
      username: session.get('username'),
      updateToken: session.get('wallet').keychainData.updateToken,
      email: email
    }
    return $http.post(Options.API_SERVER + "/user/email", data);
  }

  function changeEmail (email) {
    var data = {
      username: session.get('username'),
      updateToken: session.get('wallet').keychainData.updateToken,
      email: email
    }
    return $http.post(Options.API_SERVER + "/user/changeEmail", data);
  }

  $scope.refreshAndInitialize = function () {
    return session.getUser().refresh()
      .then(function () {
        initializeSettings();
      })
  }

  // TODO: move into user object and initialize settings
  function getSettings() {
    var data = {
      params: {
        username: session.get('username'),
        updateToken: session.get('wallet').keychainData.updateToken
      }
    }
    return $http.get(Options.API_SERVER + "/user/settings", data)
    .success(function (response) {
      $scope.toggle.recover.on = response.data.recover;
      $scope.toggle.federate.on = response.data.federate;
      $scope.toggle.email.on = response.data.email;
    })
    .error(function (response) {
      $scope.toggle.error = "Server error";
      $scope.toggle.disableToggles = true;
      // TODO retry
    });
  }

  $scope.saveSettings = function() {
    /*
    var email = $scope.newEmail;
    updateEmail(email)
    .then(function (success) {
      $scope.settings.email = email;
      return updatePassword;
    }, function (error) {
      $scope.errors.emailError = error;
      return updatePassword;
    })
    .then(function (success) {

    }, function (error) {

    })
    */
  }

  $scope.toggle = {
    disableToggles: false,
    error: null,
    recover: {
      NAME: "recover",
      API_ENDPOINT: "/user/setrecover",
      click: switchToggle,
      on: false,
      wrapper: angular.element('#recovertoggle')
    },
    email: {
      NAME: "email",
      API_ENDPOINT: "/user/setsubscribe",
      click: switchToggle,
      on: false,
      wrapper: angular.element('#emailtoggle')
    },
    federate: {
      NAME: "federate",
      API_ENDPOINT: "/user/setfederate",
      click: switchToggle,
      on: false,
      wrapper: angular.element('#federatetoggle')
    }
  }

  var toggleRequestData = {
    username: session.get('username'),
    updateToken: session.get('wallet').keychainData.updateToken
  };
  function switchToggle(toggle) {
    if ($scope.toggle.disableToggles) {
      if ($scope.toggle.error) {
        // if we're disabling these toggles, let the user know
        showError(toggle.wrapper, "Server error.");
      }
      return;
    }
    if (toggle.error) {
      toggle.error = null;
    }
    // save the toggle's current state
    var on = toggle.on;
    // add the current toggle value to the request
    toggleRequestData[toggle.NAME] = !on;
    $http.post(Options.API_SERVER + toggle.API_ENDPOINT, toggleRequestData)
    .success(function (res) {
      // switch the toggle
      toggle.on = !on;
    })
    .error(function (err, status) {
      if (status < 500 && status > 400) {
        switch (err.code) {
          case "validation_error":
            if (err.data && err.data.field == "update_token") {
              // this user's update token is invalid, send to login
              $state.transitionTo('login');
            }
        }
      } else {
        showError(toggle.wrapper, "Server error.");
      }
    });
  }

  function updatePassword(password) {
    // TODO
  }

  function showError(wrapper, title) {
    wrapper.tooltip(
      {
        title: title,
        delay: 1000
      })
      .tooltip('show');
  }

  function initializeSettings() {
    $scope.email = session.getUser().getEmailAddress();
    $scope.emailVerified = session.getUser().isEmailVerified();
    $scope.resetEmailState();
  }

  getSettings()
    .then(function () {
      initializeSettings();
    })
});
