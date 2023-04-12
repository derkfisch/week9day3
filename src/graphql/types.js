// Import built-in graphql types
const { GraphQLObjectType, GraphQLID, GraphQLString } = require('graphql');


// Define a custom User type
const UserType = new GraphQLObjectType(
    {
        name: 'User',
        description: 'User Type',
        fields: () => ({
            id: { type: GraphQLID },
            username: { type: GraphQLString },
            email: { type: GraphQLString }
        })
    }
);

// Export the custom types
module.exports = {
    UserType
};