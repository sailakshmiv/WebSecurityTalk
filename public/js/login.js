
function loadLogin() {
  $('#main').empty().mustache('login');
  setLoginBindings();
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
      localStorage.setItem('token', data.token);
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
      localStorage.setItem('token', data.token);
      loadHome();
    }, function() {
      $('signInError').removeClass('hidden');
      $('signUpError').addClass('hidden');    
    });
  });
};

function logout() {
  localStorage.setItem('token', null);
  loadLogin();
};

function isLoggedIn() {
  return !!localStorage.getItem('token');
};

function getToken() {
  return localStorage.getItem('token');
};

