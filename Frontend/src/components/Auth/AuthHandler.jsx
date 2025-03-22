import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const AuthHandler = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            const saveUserToDB = async () => {
                try {
                    // Check if user already exists in DB
                    const checkUser = await axios.get(`http://localhost:5000/users/${user.email}`);

                    if (checkUser.data && Object.keys(checkUser.data).length > 0) {
                        return;
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        // User does not exist, proceed with save
                        try {
                            const response = await axios.post('http://localhost:5000/users', {
                                name: user.username || `${user.given_name || ''} ${user.family_name || ''}`.trim(),
                                email: user.email,
                                phone: '',
                                address: '',
                            });
                        } catch (saveError) {
                            console.error('Error saving user:', saveError.response ? saveError.response.data : saveError.message);
                        }
                    } else {
                        console.error('Error checking user:', error.response ? error.response.data : error.message);
                    }
                }
            };

            saveUserToDB();
        }
    }, [isLoading, isAuthenticated, user]);

    return null;
};

export default AuthHandler;
