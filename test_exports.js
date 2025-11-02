const userController = require('./src/controllers/userController');
console.log('Functions in userController:');
console.log('- registerUser:', typeof userController.registerUser);
console.log('- loginUser:', typeof userController.loginUser);
console.log('- getUserProfile:', typeof userController.getUserProfile);
console.log('- updateUserProfile:', typeof userController.updateUserProfile);
console.log('- getUserByUsername:', typeof userController.getUserByUsername);