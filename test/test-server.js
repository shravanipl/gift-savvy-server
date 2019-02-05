const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const { HTTP_STATUS_CODES, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { startServer, stopServer, app } = require('../server.js');
const { User } = require('../users/models');
const { Recipient } = require('../recipients/models');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /api/recipients', function() {
	let testUser, jwtToken;

	before(function() {
		return startServer(true);
	});

	beforeEach(function() {
		testUser = createFakerUser();

		return User.hashPassword(testUser.password)
			.then(hashedPassword => {
				return User.create({
					name: testUser.name,
					email: testUser.email,
					username: testUser.username,
					password: hashedPassword
				}).catch(err => {
					throw new Error(err);
				});
			})
			.then(createdUser => {
				testUser.id = createdUser.id;
				jwtToken = jsonwebtoken.sign(
					{
						user: {
							id: testUser.id,
							name: testUser.name,
							email: testUser.email,
							username: testUser.username
						}
					},
					JWT_SECRET,
					{
						algorithm: 'HS256',
						expiresIn: JWT_EXPIRY,
						subject: testUser.username
					}
				);

				const seedData = [];
				for (let i = 1; i <= 10; i++) {
					const newRecipienData = createFakerRecipient();
					newRecipienData.user = createdUser.id;
					seedData.push(newRecipienData);
				}
				return Recipient.insertMany(seedData).catch(err => {
					console.error(err);
					throw new Error(err);
				});
			});
	});

	afterEach(function() {
		return new Promise((resolve, reject) => {
			// Deletes the entire database.
			mongoose.connection
				.dropDatabase()
				.then(result => {
					resolve();
				})
				.catch(err => {
					console.error(err);
					reject(err);
				});
		});
	});

	after(function() {
		stopServer();
	});

	it('Should create a new recipient', function() {
		const newRecipienDataData = createFakerRecipient();

		return chai
			.request(app)
			.post('/api/recipients')
			.set('Authorization', `Bearer ${jwtToken}`)
			.send(newRecipienDataData)
			.then(res => {
				expect(res).to.have.status(HTTP_STATUS_CODES.CREATED);
				expect(res).to.be.json;
			});
	});

	it('Should return recipients', function() {
		return chai
			.request(app)
			.get('/api/recipients')
			.set('Authorization', `Bearer ${jwtToken}`)
			.then(res => {
				expect(res).to.have.status(HTTP_STATUS_CODES.OK);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body).to.have.lengthOf.at.least(1);
				const recipient = res.body[0];
				expect(recipient).to.include.keys(
					'name',
					'relationship',
					'occassion',
					'giftDate',
					'gift',
					'budget',
					'giftStatus'
				);
			});
	});

	it('Should update a specific recipient', function() {
		let recipientToUpdate;
		const newRecipienDataData = createFakerRecipient();
		return Recipient
			.find()
			.then(recipients => {
				expect(recipients).to.have.lengthOf.at.least(1);
				recipientToUpdate = recipients[0];

				return chai
					.request(app)
					.put(`/api/recipients/${recipientToUpdate.id}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(newRecipienDataData);
			})
			.then(res => {
				expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

				return Recipient.findById(recipientToUpdate.id);
			})
			.then(recipient => {
				expect(recipient).to.be.a('object');
			});
	});

	it('Should delete a specific recipient', function() {
		let recipientToDelete;
		return Recipient
			.find()
			.then(recipients => {
				expect(recipients).to.be.a('array');
				expect(recipients).to.have.lengthOf.at.least(1);
				recipientToDelete = recipients[0];

				return chai
					.request(app)
					.delete(`/api/recipients/${recipientToDelete.id}`)
					.set('Authorization', `Bearer ${jwtToken}`);
			})
			.then(res => {
				expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

				return Recipient.findById(recipientToDelete.id);
			})
			.then(recipient => {
				expect(recipient).to.not.exist;
			});
	});

	function createFakerUser() {
		return {
			name: `${faker.name.firstName()} ${faker.name.lastName()}`,
			username: `${faker.lorem.word()}${faker.random.number(100)}`,
			password: faker.internet.password(),
			email: faker.internet.email()
		};
	}

	function createFakerRecipient() {
		return {
			name: faker.name.firstName(),
			relationship: 'Family',
			occassion: 'Christmas',
			giftDate: faker.date.past(),
			gift: faker.commerce.productName(),
			budget: faker.finance.amount(),
			giftStatus: 'Not yet'
		};
	}
});
