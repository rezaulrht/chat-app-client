import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const usersList = [
    {name:"hablu",password:"hablu123"},
    {name:"dablu",password:"dablu123"},
    {name:"kablu",password:"kablu123"},
]

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
        SecretCode: { label: "Secret Code", type: "text", placeholder: "SuperSecret" },
        
      },
      async authorize(credentials, req) {
       const{username,password}=credentials;
        const user=usersList.find(u=>u.name==username );
        if (!user) return null;
        const isPasswordValid = user.password === password;
        if (isPasswordValid) return user;
        return null;
      },
    }),
  ],
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

