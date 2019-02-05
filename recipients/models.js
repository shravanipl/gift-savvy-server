const mongoose = require('mongoose');
const Joi = require('joi');

mongoose.Promise = global.Promise;

const RecipientSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	name: {
		type: String,
		required: true
	},
	relationship: {
		type: String,
		required: true
	},
	occassion: {
		type: String,
		required: true
	},
	giftDate: {
		type: String
	},
	gift: {
		type: String
	},
	budget: {
		type: Number
	},
	giftStatus: {
		type: String,
		required: true
	}
});

RecipientSchema.methods.serialize = function() {
	let user;
	// We serialize the user if it's populated to avoid returning any sensitive information, like the password hash.
	if (typeof this.user.serialize === 'function') {
		user = this.user.serialize();
	} else {
		user = this.user;
	}
	return {
		user: user,
		id: this._id || '',
		name: this.name || '',
		relationship: this.relationship || '',
		occassion: this.occassion || '',
		giftDate: this.giftDate || '',
		gift: this.gift || '',
		budget: this.budget || '',
		giftStatus: this.giftStatus || ''
	};
};

const RecipientJoiSchema = Joi.object().keys({
	user: Joi.string().optional(),
	name: Joi.string()
		.min(1)
		.required(),
	relationship: Joi.string()
		.min(1)
		.required(),
	occassion: Joi.string()
		.min(1)
		.required(),
	giftDate: Joi.string()
		.min(1)
		.required(),
	gift: Joi.string()
		.min(1)
		.optional(),
	budget: Joi.number()
		.min(1)
		.optional(),
	giftStatus: Joi.string()
		.min(1)
		.required()
});

const Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = {
	Recipient,
	RecipientJoiSchema
};
