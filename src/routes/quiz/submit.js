const axios = require('axios');

module.exports = async (req, res) => {
    let answers = []
    for (let questionId in req.body){
        if (questionId !== 'quizId'){
            answers.push(
                {questionId: questionId, answer: req.body[questionId]}
            )
        }
    }
    try{
        const mutation = `
            mutation ($userId: ID!, $quizId: ID!, $answers: [AnswerInput]!){
                submitQuiz(userId: $userId, quizId: $quizId, answers: $answers)
            }
        `

        const { data } = await axios.post(
            process.env.GRAPHQL_ENDPOINT,
            {
                query: mutation,
                variables: {
                    userId: req.verifiedUser._id,
                    quizId: req.body.quizId,
                    answers
                }
            }
        )

        let submissionId = data.data.submitQuiz
        res.redirect(`/quiz/results/${submissionId}`)
    } catch(err){
        console.log(err);
        res.redirect('/');
    }
}