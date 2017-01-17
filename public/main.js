$(function() {
  var fadingTime = 100;
  var typingTime = 300;
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  var $window = $(window);
  var $usernameInputField = $('.usernameInput');
  var $messagesField = $('.messages'); 
  var $inputMessageField = $('.inputMessage'); 

  var $loginPage = $('.login.page');
  var $chatPage = $('.chat.page'); 

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInputField.focus();

  // var socket = io();
  var socket = io({transports: ['websocket']});
  // var socket = io({transports: ['polling']});

  if (!$window[0].WebSocket){
    var ask = window.confirm("Vas preglednik ne podrzava WebSocket, molimo vas da prestanete ziviti u prahistoriji");
    if (ask) {
        document.body.innerHTML = '';
    }
  } 

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "1 korisnik aktivan";
    } else {
      message += " " + data.numUsers + " korisnika aktivno";
    }
    log(message);
  }

  function setUsername () {
    username = cleanInput($usernameInputField.val().trim());

    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessageField.focus();

      socket.emit('add user', username);
    }
  }

  function sendMessage () {
    var message = $inputMessageField.val();
    message = cleanInput(message);
    if (message && connected) {
      $inputMessageField.val('');
      addChatMessage({
        username: username+":",
        message: message
      });
      socket.emit('new message', message);
    }
  }

  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Visuals to message
  function addChatMessage (data, options) {
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  function addChatTyping (data) {
    data.typing = true;
    data.message = 'tipka';
    addChatMessage(data);
  }

  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  function addMessageElement (el, options) {
    var $el = $(el);

    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    if (options.fade) {
      $el.hide().fadeIn(fadingTime);
    }
    if (options.prepend) {
      $messagesField.prepend($el);
    } else {
      $messagesField.append($el);
    }
    $messagesField[0].scrollTop = $messagesField[0].scrollHeight;
  }

  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= typingTime && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, typingTime);
    }
  }

  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  function getUsernameColor (username) {
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }


  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessageField.on('input', function() {
    updateTyping();
  });


  $loginPage.click(function () {
    $currentInput.focus();
  });

  $inputMessageField.click(function () {
    $inputMessageField.focus();
  });

  // Socket

  socket.on('login', function (data) {
    connected = true;
    var message = "RZNU Chat ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  socket.on('user joined', function (data) {
    log(data.username + ' se pridružio chatu');
    addParticipantsMessage(data);
  });

  socket.on('user left', function (data) {
    log(data.username + ' je napustio chat');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  socket.on('stopTyping', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    log('odspojeni ste sa chata');
  });

  socket.on('reconnect', function () {
    log('ponovo ste spojeni na chat');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    log('pogreska u ponovnom spajanju na chat');
  });

});
