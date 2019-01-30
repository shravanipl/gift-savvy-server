const express = require('express');
const Joi = require('joi');

const { HTTP_STATUS_CODES } = require('../config.js');
const { jwtPassportMiddleware } = require('../auth/strategies.js');

const { Recipient, RecipientJoiSchema } = require('./models.js');

const recipientRouter = express.Router();

recipientRouter.get('/', jwtPassportMiddleware, (request, response) => {
	console.log('IN get');
	Recipient.find({
		user: request.user.id
	})
		// .populate('user')
		.then(recipients => {
			return response.status(HTTP_STATUS_CODES.OK).json(
				recipients.map(recipient => {
					return recipient.serialize();
				})
			);
		})
		.catch(err => {
			return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(err);
		});
});

recipientRouter.get(
	'/:recipientId',
	jwtPassportMiddleware,
	(request, response) => {
		Recipient.findById({
			_id: request.params.recipientId
		})
			.then(recipient => {
				return response
					.status(HTTP_STATUS_CODES.OK)
					.json(recipient.serialize());
			})
			.catch(err => {
				return response
					.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
					.json(err);
			});
	}
);

recipientRouter.post('/', jwtPassportMiddleware, (request, response) => {
	const recipient = {
		user: request.user.id,
		name: request.body.name,
		relationship: request.body.relationship,
		occassion: request.body.occassion,
		giftDate: request.body.giftDate,
		gift: request.body.gift,
		budget: request.body.budget,
		giftStatus: request.body.giftStatus
	};
	console.log(recipient, 'post');

	const validation = Joi.validate(recipient, RecipientJoiSchema);
	if (validation.error) {
		return response.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
			code: 422,
			reason: 'ValidationError',
			error: validation.error
		});
	}
	Recipient.create(recipient).then(recipient => {
		response
			.status(HTTP_STATUS_CODES.CREATED)
			.json(recipient.serialize())
			.catch(err => {
				return response
					.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
					.json(error);
			});
	});
});

recipientRouter.put(
	'/:recipientId',
	jwtPassportMiddleware,
	(request, response) => {
		console.log('IN put');

		const updatedRecipient = {
			name: request.body.name,
			relationship: request.body.relationship,
			occassion: request.body.occassion,
			giftDate: request.body.giftDate,
			gift: request.body.gift,
			budget: request.body.budget,
			giftStatus: request.body.giftStatus
		};
		console.log(updatedRecipient, 'edit');
		const validation = Joi.validate(updatedRecipient, RecipientJoiSchema);
		if (validation.error) {
			return response
				.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.json(validation.error);
		}
		Recipient.findByIdAndUpdate(request.params.recipientId, {
			$set: updatedRecipient
		})
			.then(() => {
				return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
			})
			.catch(error => {
				return response
					.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
					.json(error);
			});
	}
);

recipientRouter.delete(
	'/:recipientid',
	jwtPassportMiddleware,
	(request, response) => {
		console.log('IN delete');

		Recipient.findByIdAndRemove(request.params.recipientid)
			.then(() => {
				return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
			})
			.catch(error => {
				return response
					.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
					.json(error);
			});
	}
);

module.exports = {
	recipientRouter
};
