const axios = require('axios');

module.exports = async (req, res) => {
    try{
        const mutation = `
            mutation ($email: String!, $password: String!){
                login(email: $email password: $password)
            }
        `

        const { data } = await axios.post(process.env.GRAPHQL_ENDPOINT, 
                {
                    query: mutation,
                    variables: {
                        email: req.body.email,
                        password: req.body.password
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        
        const jwtoken = data.data.login;
        res.cookie('jwtoken', jwtoken, { httpOnly: true });
        res.redirect('/');
    } catch(err){
        console.log(err);
        res.redirect('/auth/login');
    }
}