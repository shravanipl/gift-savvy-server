module.exports = {
	PORT: process.env.PORT || 8080,
	HTTP_STATUS_CODES: {
		OK: 200,
		CREATED: 201,
		NO_CONTENT: 204,
		BAD_REQUEST: 400,
		UNAUTHORISED: 401,
		NOT_FOUND: 404,
		INTERNAL_SERVER_ERROR: 500
	},
	MONGO_URL:
		process.env.MONGO_URL ||
		'mongodb://user:user12@ds157544.mlab.com:57544/gift_savvy',
	TEST_MONGO_URL:
		process.env.TEST_MONGO_URL ||
		'mongodb://test1:test1234@ds157544.mlab.com:57544/gift_savvy',
	GIFT_SEARCH_API_URL:
		process.env.GIFT_SEARCH_API_URL ||
		'https://rest.viglink.com/api/product/search',
	JWT_SECRET: process.env.JWT_SECRET || 'default',
	JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
	CLIENT_ORIGIN:
		process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};
