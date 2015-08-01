var fork = require('child_process').fork;

var config = {
}

fork('./answeringApi.js');
fork('./usersApi.js');
fork('./keepConnService.js');
fork('./web/web.js');