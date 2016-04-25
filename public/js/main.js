
$(document).ready(function() {
  $.Mustache.load('templates.html')
  .done(function() {
    loadHome();
  });
});

// Tell AJAX we're doing JSON
$.ajaxSetup({
  format: 'json',
  contentType: 'application/json'
});

function loadHome() {
  $('#main').empty().mustache('home'); 
  // TODO
  getTodos();
  setMainBindings();
};

function getTodos() {
  $.ajax({
    url: '/api'
  }).then(function(data) {
    $('#table-body')
    .empty()
    .mustache('rows', {todos: data});
    setTableBindings();
  });
};

function setMainBindings() {
  $('#addTodo').click(function() {
    showModal('Add TODO', 'addDialog')
    .then(function() {
      var task = $('#addTaskText').val();
      $.ajax({
        url: '/api',
        method: 'POST',
        data: JSON.stringify({task: task, done: false}),
        success: function (data) {
          $('#table-body')
          .mustache('rows', {todos: data});
          setTableBindings();
        }
      });
    });
  });
  $('#logout').click(function() {
    logout();
  });
};

function setTableBindings() {
  // Bind checkbox to update
  $('input[type="checkbox"]').unbind('click');
  $('input[type="checkbox"]').click(function() {
    var checked = $(this).prop('checked');
    var id = $(this).attr('key');
    $.ajax({
      url: '/api/' + id,
      method: 'PUT',
      data: JSON.stringify({done: checked})
    })
  });
  // Bind edit to modal
  $('span.glyphicon-pencil').unbind('click');
  $('span.glyphicon-pencil').click(function() {
    var id = $(this).attr('key');
    var task = $(this).attr('task');
    showModal('Edit TODO', 'editDialog', {task: task})
    .then(function() {
      task = $('#editTaskText').val();
      $.ajax({
        url: '/api/' + id,
        method: 'PUT',
        data: JSON.stringify({task: task})
      });
      $('div.task[key="'+id+'"]').html(task);
    });
  });
  // Bind trash to delete
  $('span.glyphicon-trash').unbind('click');
  $('span.glyphicon-trash').click(function() {
    var id = $(this).attr('key');
    $(this).parents('tr').remove();
    $.ajax({
      url: '/api/' + id,
      method: 'DELETE'
    });
  });
};

function showModal(title, template, data) {
  $('#modalBody').empty().mustache(template, data);
  $('#modalLabel').html(title);
  $('#modal').modal('show'); 
  var result = $.Deferred();
  $('#modalSave').click(function() {
    result.resolve();         
  });
  $('#modalClose').click(function() {
    result.reject();
  });
  return result.promise();
};
