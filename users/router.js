const express = require('express');

const { HTTP_STATUS_CODES } = require('../config.js');
const { User } = require('./models.js');

const userRouter = express.Router();

userRouter.post('/', (request, response) => {
	const newUser = {
		name: request.body.name,
		email: request.body.email,
		username: request.body.username,
		password: request.body.password
	};
	if (request.body.password)
		return User.hashPassword(newUser.password)
		.then(passwordHash => {
			newUser.password = passwordHash;

			User.create(newUser)
				.then(createdUser => {
					return response
						.status(HTTP_STATUS_CODES.CREATED)
						.json(createdUser.serialize());
				})
				.catch(error => {
					console.log(error);
					if (error.message.includes('user validation failed')) {
						return response
							.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
							.json(error.message.substring(error.message.indexOf(': P') + 1));
					} else if (error.code === 11000) {
						console.log(error);
						if (error.errmsg.includes('$username_1 dup')) {
							return response
								.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
								.json({
									code: 422,
									reason: 'ValidationError',
									message: 'Username already taken',
									location: 'username'
								});
						} else if (error.errmsg.includes('$email_1 dup')) {
							return response
								.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
								.json({
									code: 422,
									reason: 'ValidationError',
									message: 'Email already registered',
									location: 'email'
								});
						}
					} else {
						return response
							.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
							.json(error);
					}
				});
		});
});

userRouter.get('/', (request, response) => {
	User.find()
		.then(users => {
			return response
				.status(HTTP_STATUS_CODES.OK)
				.json(users.map(user => user.serialize()));
		})
		.catch(error => {
			return response
				.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
				.json(error);
		});
});

userRouter.get('/:userid', (request, response) => {
	User.findById(request.params.userid)
		.then(user => {
			return response.status(HTTP_STATUS_CODES.OK).json(user.serialize());
		})
		.catch(error => {
			return response
				.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
				.json(error);
		});
});

module.exports = {
	userRouter
};
