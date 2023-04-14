const { GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const { User, Quiz, Question, Submission } = require('../models');
const bcrypt = require('bcrypt');
const { createJWT } = require('../util/auth');
const { QuestionInputType, AnswerInputType } = require('./types');


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
    description: 'Authenticate a user',
    args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        // Get the user form the database based on email
        const user = await User.findOne({ email: args.email });
        // Get the hashed password from the user OR set it to an empty string if no user
        const hashedPassword = user?.password || '';
        // Check the password
        const correctPassword = await bcrypt.compare(args.password, hashedPassword);
        // If no user with email or the password is incorrect
        if (!user || !correctPassword){
            throw new Error('Invalid Credentials');
        };
        // credentail our user (create a token)
        const token = createJWT(user);

        return token;
    }
};


const createQuiz = {
    type: GraphQLString,
    description: "Creates a new quiz",
    args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: { type: GraphQLID },
        questions: { type: new GraphQLNonNull(new GraphQLList(QuestionInputType))}
    },
    async resolve(parent, args){
        // Generate a slug for our quiz based on the title
        let slugify = args.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        // Add a random integer to the end of the slug, check that the slug does not already exist,
        // if it does exist, generate a new slug number
        let fullSlug;
        let existingQuiz;
        do {
            let slugId = Math.floor(Math.random() * 1000);
            fullSlug = `${slugify}-${slugId}`;

            existingQuiz = await Quiz.findOne({ slug: fullSlug })
        } while (existingQuiz);

        // Create a new instance of Quiz
        const quiz = new Quiz({
            title: args.title,
            slug: fullSlug,
            description: args.description,
            userId: args.userId
        });

        await quiz.save();

        // Once the quiz is created, loop through all of the questions
        for (let question of args.questions){
            // Create a new Question Instance with QuestionInput Data and quiz id from the newly created quiz
            const newQuestion = new Question({
                title: question.title,
                correctAnswer: question.correctAnswer,
                order: question.order,
                quizId: quiz.id
            })
            // Save to the database
            await newQuestion.save();
        }

        return quiz.slug
    }
}


const submitQuiz = {
    type: GraphQLID,
    description: 'Submit a quiz',
    args: {
        userId: { type: GraphQLID },
        quizId: { type: GraphQLID },
        answers: { type: new GraphQLNonNull(new GraphQLList(AnswerInputType))}
    },
    async resolve(parent, args){
        try{
            let correct = 0;
            let totalScore = args.answers.length;

            for (let answer of args.answers){
                const question = await Question.findById(answer.questionId);
                if (answer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()){
                    correct++
                }
            }

            const score = ( correct / totalScore ) * 100;
            const submission = new Submission({
                userId: args.userId,
                quizId: args.quizId,
                score
            })

            await submission.save();

            return submission.id

        }catch(err){
            console.log(err)
        }
    }
}


module.exports = {
    register,
    login,
    createQuiz,
    submitQuiz,
}