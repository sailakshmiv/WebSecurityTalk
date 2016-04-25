
function isLoggedIn() {
  // TODO
};

function setToken(token) {
  // TODO
};

function getToken() {
  // TODO
};

function loadLogin() {
  $('#main').empty().mustache('login');
  setLoginBindings();
};

function logout() {
  setToken(null);
  loadLogin();
};

function setLoginBindings() {
  $('#signIn').click(function() {
    var username = $('#inputUsername').val();
    var password = $('#inputPassword').val();
    var data = {
      username: username,
      password: password
    };
    $.ajax({
      url: '/login',
      method: 'POST',
      data: JSON.stringify(data)
    }).then(function(data) {
      setToken(data.token);
      loadHome();
    }, function() {
      $('signUpError').removeClass('hidden');
      $('signInError').addClass('hidden');    
    });
  });
  $('#signUp').click(function() {
    var username = $('#inputUsername').val();
    var password = $('#inputPassword').val();
    var data = {
      username: username,
      password: password
    };
    $.ajax({
      url: '/signup',
      method: 'POST',
      data: JSON.stringify(data)
    }).then(function(data) {
      setToken(data.token);
      loadHome();
    }, function() {
      $('signInError').removeClass('hidden');
      $('signUpError').addClass('hidden');    
    });
  });
};
