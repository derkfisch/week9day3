// Import built-in graphql types
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLFloat } = require('graphql');
// Import User, Question model
const { User, Question, Quiz, Submission } = require('../models');


// Define a custom User type
const UserType = new GraphQLObjectType(
    {
        name: 'User',
        description: 'User Type',
        fields: () => ({
            id: { type: GraphQLID },
            username: { type: GraphQLString },
            email: { type: GraphQLString },
            quizzes: {
                type: new GraphQLList(QuizType),
                resolve(parent, args){
                    return Quiz.find( { userId: parent.id })
                }
            },
            submissions: {
                type: new GraphQLList(SubmissionType),
                resolve(parent, args){
                    return Submission.find({ userId: parent.id })
                }
            }
        })
    }
);


// Define a custom Quiz type
const QuizType = new GraphQLObjectType(
    {
        name: 'Quiz',
        description: 'Quiz Type',
        fields: () => ({
            id: { type: GraphQLID },
            slug: { type: GraphQLString },
            title: { type: GraphQLString },
            description: { type: GraphQLString },
            userId: { type: GraphQLID },
            user: {
                type: UserType,
                resolve(parent, args){
                    return User.findById(parent.userId)
                }
            },
            questions: {
                type: new GraphQLList(QuestionType),
                resolve(parent, args){
                    return Question.find( { quizId: parent.id })
                }
            },
            submissions: {
                type: new GraphQLList(SubmissionType),
                resolve(parent, args){
                    return Submission.find({ quizId: parent.id })
                }
            },
            avgScore: {
                type: GraphQLFloat,
                async resolve(parent, args){
                    const submissions = await Submission.find({ quizId: parent.id });
                    let score = 0;

                    for (let sub of submissions){
                        score += sub.score
                    }

                    return (submissions.length) ? (score / submissions.length) : 0
                }
            }
        })
    }
);


// Create a Question Type (INPUT) for mutation of creating a quiz
const QuestionInputType = new GraphQLInputObjectType(
    {
        name: 'QuestionInput',
        description: 'Question Input Type',
        fields: () => ({
            title: { type: GraphQLString },
            order: { type: GraphQLInt },
            correctAnswer: { type: GraphQLString }
        })
    }
);


// Create a Question Type for queries
const QuestionType = new GraphQLObjectType(
    {
        name: 'Question',
        description: 'Question Type',
        fields: () => ({
            id: { type: GraphQLID },
            title: { type: GraphQLString },
            correctAnswer: { type: GraphQLString },
            order: { type: GraphQLInt },
            quizId: { type: GraphQLID }
        })
    }
)


// Create an AnswerInput Type for submitting a quiz
const AnswerInputType = new GraphQLInputObjectType(
    {
        name: 'AnswerInput',
        description: 'Answer Input Type',
        fields: () => ({
            questionId: { type: GraphQLID },
            answer: { type: GraphQLString }
        })
    }
)


// Create a new Submission Type that will get quiz submissions and quiz and and user info
const SubmissionType = new GraphQLObjectType(
    {
        name: 'Submission',
        description: 'Submission Type',
        fields: () => ({
            id: { type: GraphQLID },
            quizId: { type: GraphQLID },
            userId: { type: GraphQLID },
            score: { type: GraphQLFloat },
            user: {
                type: UserType,
                resolve(parent, args){
                    return User.findById(parent.userId)
                }
            },
            quiz: {
                type: QuizType,
                resolve(parent, args){
                    return Quiz.findById(parent.quizId)
                }
            }
        })
    }
)


// Export the custom types
module.exports = {
    UserType,
    QuizType,
    QuestionInputType,
    AnswerInputType,
    SubmissionType,
};