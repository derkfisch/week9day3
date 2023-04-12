const { GraphQLString } = require('graphql');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { createJWT } = require('../util/auth')


const register = {
    type: GraphQLString,
    description: 'Register a new user',
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        const checkUser = await User.findOne({ email: args.email }).exec();
        if (checkUser){
            throw new Error("User with this email address already exists");
        }

        const { username, email, password } = args;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: passwordHash });

        await user.save();

        const token = createJWT(user);

        return token
    }
}

const login = {
	type: GraphQLString,
	description: "Log in a user that exists in the database",
	args: {
		email: { type: GraphQLString },
		password: { type: GraphQLString },
	},
	async resolve(parent, args) {
		const { email, password } = args;
		const user = await User.findOne({ email }).exec();
		if (!user) {
			throw new Error("User not found");
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new Error("Invalid login");
		}
		const token = createJWT(user);
		return token;
	},
};

module.exports = {
    register,
    login
}