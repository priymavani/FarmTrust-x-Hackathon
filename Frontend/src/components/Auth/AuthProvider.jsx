import { Auth0Provider } from '@auth0/auth0-react';
import AuthHandler from './AuthHandler';

const AuthProvider = ({ children }) => {
    return (
        <Auth0Provider
            domain="dev-jkudd2nioufkyaqt.us.auth0.com"
            clientId="I6ZDerYcqO1tRCqUZB0SrYSwXOiD3qrc"
            authorizationParams={{
                redirect_uri: window.location.origin, 
            }}
        >
            {children}
            <AuthHandler />
        </Auth0Provider>
    );
};

export default AuthProvider;
