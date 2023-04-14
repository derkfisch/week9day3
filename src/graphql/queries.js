// Import Type from graphql
const { GraphQLList, GraphQLID, GraphQLString } = require('graphql');
// Import our own created types
const { UserType, QuizType, SubmissionType } = require('./types');
// Import the User and Quiz model so we can query MongoDB
const { User, Quiz, Submission } = require('../models');


const users = {
    type: new GraphQLList(UserType),
    description: 'Get all users from the database',
    async resolve(parent, args){
        return await User.find()
    }
}


const user = {
    type: UserType,
    description: 'Query single user by ID',
    args: {
        id: { type: GraphQLID }
    },
    resolve(parent, args){
        return User.findById(args.id)
    }
}


const quizBySlug = {
    type: QuizType,
    description: 'Query a quiz by its unique slug',
    args: {
        slug: { type: GraphQLString }
    },
    resolve(parent, args){
        return Quiz.findOne({ slug: args.slug })
    }
}


const submission = {
    type: SubmissionType,
    description: 'Get a submission by its ID',
    args: {
        id: { type: GraphQLID }
    },
    resolve(parent, args){
        return Submission.findById(args.id)
    }
}


module.exports = {
    users,
    user,
    quizBySlug,
    submission,
}
