const backendUrl = process.env.REACT_APP_BACKEND_URL;

async function refreshToken() {
    try {
        const refresh = localStorage.getItem('refresh');
        const token = localStorage.getItem('token');
        console.log(refresh);
        if (!refresh) {
            throw new Error('Refresh token not found');
        }

        const response = await fetch( backendUrl + '/api/users/token/refresh/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refresh }), // Corrected the key name
        });

        const data = await response.json();
        const newAccessToken = data.access;

        // Update the stored access token
        localStorage.setItem('token', newAccessToken);

        return newAccessToken;
    } catch (error) {
        console.error('Token refresh failed', error);
        // Optionally, you might handle the failure differently, such as redirecting to the login page
        window.location.href = '/login';
    }
}

  

async function fetchWithToken(url, options) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
  
      const response = await fetch(backendUrl + url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
  
      // If the request fails due to token expiration, attempt token refresh
      if (response.status === 401) {
        await refreshToken();
        // Retry the original request with the new token
        return fetchWithToken(url, options);
      }
  
      return response;
    } catch (error) {
      console.error('Failed to fetch resource', error);
      throw error;
    }
  }

  export default fetchWithToken;