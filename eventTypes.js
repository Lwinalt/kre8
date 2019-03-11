const eventTypes = {};

//** -------- AWS INITIAL SETUP EVENTS -------------------- **/

eventTypes.CHECK_CREDENTIAL_STATUS = 'CHECK_CREDENTIAL_STATUS';
eventTypes.RETURN_CREDENTIAL_STATUS = 'RETURN_CREDENTIAL_STATUS';

eventTypes.UPDATE_STATUS = 'UPDATE_STATUS';

eventTypes.SET_AWS_CREDENTIALS = 'SET_AWS_CREDENTIALS';
eventTypes.HANDLE_AWS_CREDENTIALS = 'HANDLE_AWS_CREDENTIALS';

//TODO: Delete or refactor this set
eventTypes.INSTALL_IAM_AUTHENTICATOR = 'INSTALL_IAM_AUTHENTICATOR';
eventTypes.CONFIRM_IAM_AUTHENTICATOR_INSTALLED = 'CONFIRM_IAM_AUTHENTICATOR_INSTALLED';

//** -------- AWS CREATING CLUSTER EVETNS -------------------- **/

eventTypes.CREATE_CLUSTER = 'CREATE_CLUSTER';

eventTypes.HANDLE_STATUS_CHANGE = 'HANDLE_STATUS_CHANGE';

eventTypes.HANDLE_ERRORS = 'HANDLE_ERRORS';








eventTypes.CREATE_IAM_ROLE = 'CREATE_IAM_ROLE';
// eventTypes.HANDLE_NEW_ROLE = 'HANDLE_NEW_ROLE';

eventTypes.CREATE_TECH_STACK = 'CREATE_TECH_STACK';
// eventTypes.HANDLE_NEW_TECH_STACK = 'HANDLE_NEW_TECH_STACK';

// eventTypes.CREATE_CLUSTER = 'CREATE_CLUSTER';
// eventTypes.HANDLE_NEW_CLUSTER = 'HANDLE_NEW_CLUSTER';

// eventTypes.HANDLE_NEW_NODES = 'HANDLE_NEW_NODES';

//** -------- KUBECTL EVENT TYPES -------------------------- **/
eventTypes.CREATE_POD = 'CREATE_POD';
eventTypes.HANDLE_NEW_POD = 'HANDLE_NEW_POD';

eventTypes.CREATE_DEPLOYMENT = 'CREATE_DEPLOYMENT';
eventTypes.HANDLE_NEW_DEPLOYMENT = 'HANDLE_NEW_DEPLOYMENT';

eventTypes.CREATE_SERVICE = 'CREATE_SERVICE';
eventTypes.HANDLE_NEW_SERVICE = 'HANDLE_NEW_SERVICE';

eventTypes.GET_CLUSTER_DATA = 'GET_CLUSTER_DATA';
eventTypes.SEND_CLUSTER_DATA = 'SEND_CLUSTER_DATA';

module.exports = eventTypes;
